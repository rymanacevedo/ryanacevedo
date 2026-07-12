#!/usr/bin/env bash
set -euo pipefail

mode=${1:-doctor}
script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
repo=$(cd -- "$script_dir/.." && pwd)
runner_user=${SANDCASTLE_RUNNER_USER:-${SUDO_USER:-$(id -un)}}
container_uid=${SANDCASTLE_CONTAINER_UID:-1001}
container_gid=${SANDCASTLE_CONTAINER_GID:-1002}
image=${SANDCASTLE_IMAGE:-sandcastle:ryanacevedo}
probe_root=
probe_ref=

cleanup_probes() {
	[[ -z "$probe_root" ]] || rm -rf "$probe_root"
	[[ -z "$probe_ref" ]] || rm -rf "$probe_ref"
}

die() {
	echo "Sandcastle runner check failed: $*" >&2
	exit 1
}

require_command() {
	command -v "$1" >/dev/null 2>&1 || die "missing required command: $1"
}

mapping_start() {
	local file=$1
	awk -F: -v user="$runner_user" '$1 == user { print $2; exit }' "$file"
}

mapped_id() {
	local start=$1
	local container_id=$2
	if (( container_id == 0 )); then
		id -u "$runner_user"
	else
		echo $((start + container_id - 1))
	fi
}

load_mapping() {
	[[ -r /etc/subuid ]] || die "/etc/subuid is unavailable"
	[[ -r /etc/subgid ]] || die "/etc/subgid is unavailable"

	local subuid_start subgid_start
	subuid_start=$(mapping_start /etc/subuid)
	subgid_start=$(mapping_start /etc/subgid)
	[[ -n "$subuid_start" ]] || die "no subuid range for $runner_user"
	[[ -n "$subgid_start" ]] || die "no subgid range for $runner_user"

	mapped_uid=$(mapped_id "$subuid_start" "$container_uid")
	mapped_gid=$(mapped_id "$subgid_start" "$container_gid")
}

set_mapped_acl() {
	local target=$1
	local runner_uid
	[[ -e "$target" ]] || return 0
	runner_uid=$(id -u)
	find "$target" -user "$runner_uid" -exec setfacl -m "u:${mapped_uid}:rwX" {} +
	find "$target" -type d -user "$runner_uid" -exec setfacl -m "d:u:${mapped_uid}:rwx" {} +
}

repair_permissions() {
	(( EUID == 0 )) || die "repair must run as root"
	require_command setfacl
	load_mapping

	setfacl -R -m "u:${runner_user}:rwX,u:${mapped_uid}:rwX" "$repo"
	find "$repo" -type d -exec setfacl -m "d:u:${runner_user}:rwx,d:u:${mapped_uid}:rwx" {} +

	runuser -u "$runner_user" -- git config --global --add safe.directory "$repo"
	echo "Repaired dual-writer ACLs for $runner_user and mapped UID $mapped_uid."
}

prepare_worktree() {
	require_command setfacl
	load_mapping

	local git_dir common_dir branch ref_path
	git_dir=$(git rev-parse --absolute-git-dir)
	common_dir=$(git rev-parse --path-format=absolute --git-common-dir)
	branch=$(git symbolic-ref --quiet --short HEAD || true)

	set_mapped_acl "$PWD"
	set_mapped_acl "$git_dir"

	if [[ -n "$branch" ]]; then
		ref_path="$common_dir/refs/heads/$branch"
		if [[ -e "$ref_path" && $(stat -c %u "$ref_path") == $(id -u) ]]; then
			setfacl -m "u:${mapped_uid}:rw-" "$ref_path"
		fi
	fi
}

doctor() {
	require_command docker
	require_command getfacl
	load_mapping

	[[ $(id -un) == "$runner_user" ]] || die "run doctor as $runner_user (current user: $(id -un))"
	[[ ${DOCKER_HOST:-} == unix://* ]] || die "DOCKER_HOST must point at the rootless Docker Unix socket"

	local image_user
	image_user=$(docker image inspect "$image" --format '{{.Config.User}}' 2>/dev/null) ||
		die "image $image is missing; rebuild it before running Sandcastle"
	[[ "$image_user" == "$container_uid:$container_gid" ]] ||
		die "image user is $image_user, expected $container_uid:$container_gid"

	probe_root="$repo/.sandcastle/worktrees/.runner-doctor-$$"
	probe_ref="$repo/.git/refs/heads/sandcastle/.runner-doctor-$$"
	trap cleanup_probes EXIT

	mkdir -p "$probe_root" "$probe_ref"
	touch "$probe_root/host-created" "$probe_ref/host-created"

	if ! docker run --rm --entrypoint sh \
		--user "$container_uid:$container_gid" \
		-v "$repo:/home/agent/workspace" \
		-w /home/agent/workspace \
		"$image" -lc "
      set -eu
      printf container >> .sandcastle/worktrees/.runner-doctor-$$/host-created
      touch .sandcastle/worktrees/.runner-doctor-$$/container-created
      printf container >> .git/refs/heads/sandcastle/.runner-doctor-$$/host-created
      touch .git/refs/heads/sandcastle/.runner-doctor-$$/container-created
      git config --global --add safe.directory /home/agent/workspace
      git status --short --branch >/dev/null
    "; then
		cat >&2 <<EOF
Sandcastle cannot write host-created worktree or Git metadata as the container agent.
Repair explicitly, then rerun the doctor:

  sudo env SANDCASTLE_RUNNER_USER=$runner_user bash $repo/.sandcastle/runner-permissions.sh repair
EOF
		exit 1
	fi

	echo "Sandcastle runner healthy: $runner_user -> container $container_uid:$container_gid -> host $mapped_uid:$mapped_gid"
}

case "$mode" in
	doctor) doctor ;;
	repair) repair_permissions ;;
	prepare-worktree) prepare_worktree ;;
	*) die "usage: $0 {doctor|repair|prepare-worktree}" ;;
esac
