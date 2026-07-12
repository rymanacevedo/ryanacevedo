#!/usr/bin/env bash
set -euo pipefail

codex_mount=/mnt/host-codex
codex_home=${CODEX_HOME:-/home/agent/.codex}
tmp_dir=${TMPDIR:-/home/agent/tmp}
bun_cache_dir=${BUN_INSTALL_CACHE_DIR:-/home/agent/.bun-cache}
install_lock_dir="$bun_cache_dir/install.lock"
auth_only=false

case "${1:-}" in
	--auth-only)
		auth_only=true
		;;
esac

echo "Sandbox setup user: $(id)"
echo "Sandbox setup workspace: $(pwd)"

mkdir -p "$codex_home"

if [ ! -r "$codex_mount/auth.json" ]; then
	echo "Codex auth is missing or unreadable: $codex_mount/auth.json" >&2
	ls -ld "$codex_mount" >&2 || true
	ls -l "$codex_mount/auth.json" >&2 || true
	exit 1
fi

cp "$codex_mount/auth.json" "$codex_home/auth.json"

if [ -f "$codex_mount/config.toml" ]; then
	cp "$codex_mount/config.toml" "$codex_home/config.toml"
fi

git config --global --add safe.directory "$(pwd)"
git status --short --branch >/dev/null

if [ "$auth_only" = true ]; then
	exit 0
fi

mkdir -p "$tmp_dir" "$bun_cache_dir"
touch .sandcastle-write-test
rm .sandcastle-write-test
touch "$tmp_dir/.write-test" "$bun_cache_dir/.write-test"
rm "$tmp_dir/.write-test" "$bun_cache_dir/.write-test"

verify_native_dependencies() {
	if [ ! -d node_modules ]; then
		return 1
	fi

	node <<'NODE'
const checks = [
  {
    name: "esbuild",
    run: (mod) => mod.transformSync("const ok = true", { loader: "js" }),
  },
  {
    name: "rollup",
    run: (mod) => {
      if (typeof mod.rollup !== "function") throw new Error("rollup export missing");
    },
  },
  {
    name: "lightningcss",
    run: (mod) => mod.transform({ filename: "check.css", code: Buffer.from(".x{color:red}") }),
  },
  {
    name: "sharp",
    optional: true,
    run: (mod) => {
      if (typeof mod !== "function") throw new Error("sharp export missing");
    },
  },
];

for (const check of checks) {
  let mod;
  try {
    mod = require(check.name);
  } catch (error) {
    if (check.optional && error?.code === "MODULE_NOT_FOUND") continue;
    throw error;
  }

  check.run(mod);
  console.log(`${check.name} native dependency ok`);
}
NODE
}

ensure_host_cleanup_access() {
	if [ -d node_modules ]; then
		# Bun may narrow the ACL mask while installing dependencies. Restore group
		# directory writes so the host can remove ephemeral worktrees.
		find node_modules -type d -exec chmod g+rwx {} +
	fi
}

reset_node_modules() {
	echo "Resetting sandbox node_modules"
	if [ -L node_modules ]; then
		rm node_modules
	else
		rm -rf node_modules
	fi
}

if [ -e node_modules ]; then
	if verify_native_dependencies; then
		ensure_host_cleanup_access
		echo "Sandbox dependencies valid"
		exit 0
	fi

	reset_node_modules
fi

if [ -d "$install_lock_dir" ] && [ -z "$(find "$install_lock_dir" -mmin -20 -print -quit)" ]; then
	echo "Removing stale Bun install lock"
	rmdir "$install_lock_dir" 2>/dev/null || true
fi

lock_started=$SECONDS
while ! mkdir "$install_lock_dir" 2>/dev/null; do
	if (( SECONDS - lock_started > 240 )); then
		echo "Timed out waiting for Bun install lock" >&2
		exit 1
	fi
	sleep 1
done

cleanup_lock() {
	rmdir "$install_lock_dir" 2>/dev/null || true
}
trap cleanup_lock EXIT

if [ -e node_modules ]; then
	if verify_native_dependencies; then
		ensure_host_cleanup_access
		echo "Sandbox dependencies valid after waiting"
		exit 0
	fi

	reset_node_modules
fi

echo "Installing sandbox dependencies"
bun install --frozen-lockfile --backend=copy
verify_native_dependencies
ensure_host_cleanup_access
