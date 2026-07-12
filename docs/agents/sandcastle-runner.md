# Sandcastle Runner

## Host Modes

### macOS with Docker Desktop

On macOS, Sandcastle uses the current user's UID/GID for both the image and
runtime container. Docker Desktop handles bind-mount ownership, so subordinate
IDs, `getfacl`, and ACL repair are not required.

Build and verify the local image after cloning or changing the Dockerfile:

```bash
bun run sandcastle:build-image
bun run sandcastle:doctor
```

The doctor verifies that the image identity matches the current macOS user and
that the container can write both worktree files and Git metadata. If it fails,
confirm the repository is shared with Docker Desktop and rebuild the image.

Start a run from `master` after the doctor passes:

```bash
bun run sandcastle
```

### Dedicated Linux runner

Sandcastle runs from `/home/claw/ryanacevedo` as `claw` using rootless Docker
at `unix:///run/user/1001/docker.sock`. Keep human checkouts separate.

On Linux, the image and `.sandcastle/main.ts` both use container UID `1001` and GID
`1002`. Rootless Docker maps those IDs into `claw`'s subordinate ranges. This
creates two writers:

- Host Sandcastle creates worktrees, Git metadata, and branch refs as `claw`.
- The container agent edits and commits as the mapped subordinate UID.

Both identities need access and inherited default ACLs. Do not solve ownership
failures by running the container as root, adding `nobody`, or cloning into
`/tmp`.

## Install and Repair

Install `acl`, rootless Docker, Bun, GitHub CLI, and Codex for `claw`.
Authenticate as `claw`:

```bash
sudo -iu claw
gh auth login -h github.com
codex login
```

Repair repository ACLs after initial setup or an ownership failure:

```bash
cd /home/claw/ryanacevedo
sudo env SANDCASTLE_RUNNER_USER=claw \
  bash .sandcastle/runner-permissions.sh repair
```

The repair preserves ownership while granting `claw` and the dynamically
mapped container UID recursive `rwX` access and inherited directory ACLs.

Rebuild the image after Dockerfile or UID/GID changes:

```bash
sudo -u claw bash -lc '
  cd /home/claw/ryanacevedo
  export PATH="$HOME/.bun/bin:$PATH"
  export DOCKER_HOST=unix:///run/user/1001/docker.sock
  bun run sandcastle:build-image
'
```

## Verify and Run

Always run the doctor before a long session:

```bash
sudo -u claw bash -lc '
  cd /home/claw/ryanacevedo
  export PATH="$HOME/.bun/bin:$PATH"
  export DOCKER_HOST=unix:///run/user/1001/docker.sock
  bun run sandcastle:doctor
'
```

The doctor checks the rootless socket, image identity, subordinate-ID mapping,
container writes to host-created worktree and Git-ref probes, and Git safe
directory behavior. It removes its probes on exit. The main runner executes
the same doctor before spending model tokens.

Start Sandcastle only after the doctor passes:

```bash
sudo -u claw bash -lc '
  cd /home/claw/ryanacevedo
  export PATH="$HOME/.bun/bin:$PATH"
  export DOCKER_HOST=unix:///run/user/1001/docker.sock
  bun run sandcastle
'
```

Each worktree receives host-side ACL preparation before its container starts.
Container setup then installs Linux-native dependencies, verifies workspace
writes, and validates Git access.

## Recovery After Synchronization Failure

Use this process when logs mention root-owned files, a writable `/tmp` clone,
`safe.directory`, direct pushes, or `No commits to sync out`.

### 1. Quiesce and inventory

Stop planning new work. Let active implementers reach a commit when possible.
Record processes, containers, worktrees, local refs, and remote refs:

```bash
ps aux | rg 'bun run sandcastle|\.sandcastle/main\.ts|codex exec'
docker ps --format '{{.Names}} {{.Status}}' | rg sandcastle
git worktree list --porcelain
git for-each-ref refs/heads/sandcastle \
  --format='%(refname:short) %(objectname)'
git ls-remote --heads origin 'refs/heads/sandcastle/*'
```

For graceful shutdown, send `SIGINT` to the top-level runner and wait for it to
close containers. Do not use `kill -9`.

### 2. Salvage container-only commits

If an agent committed only in a container clone, create a Git bundle and
stream it to the host:

```bash
container=<sandcastle-container>
issue=<issue-number>
docker exec "$container" sh -lc \
  "git -C /tmp/ryanacevedo-$issue bundle create /tmp/issue-$issue.bundle sandcastle/issue-$issue"
docker exec "$container" base64 "/tmp/issue-$issue.bundle" \
  | base64 -d > "/tmp/issue-$issue.bundle"
git fetch "/tmp/issue-$issue.bundle" \
  "sandcastle/issue-$issue:refs/heads/sandcastle/issue-$issue-recovered"
git log --oneline "master..sandcastle/issue-$issue-recovered"
```

Keep the recovered suffix until ancestry is checked.

### 3. Reconcile refs

Fetch remote Sandcastle branches without changing local branches:

```bash
git fetch origin \
  '+refs/heads/sandcastle/*:refs/remotes/origin/sandcastle/*'
```

Inspect each affected issue:

```bash
issue=<issue-number>
git rev-list --left-right --count \
  "sandcastle/issue-$issue...origin/sandcastle/issue-$issue"
git log --oneline --left-right \
  "sandcastle/issue-$issue...origin/sandcastle/issue-$issue"
```

Fast-forward only when the local ref is an ancestor and no worktree has it
checked out. Retain both refs when branches diverge.

### 4. Repair and resume

After updating the runner checkout, repair ACLs and require the doctor to pass:

```bash
git worktree prune --verbose
sudo env SANDCASTLE_RUNNER_USER=claw \
  bash .sandcastle/runner-permissions.sh repair
sudo -u claw bash -lc '
  cd /home/claw/ryanacevedo
  export DOCKER_HOST=unix:///run/user/1001/docker.sock
  bun run sandcastle:doctor
'
```

The runner detects commits already present on deterministic issue branches but
absent from `master`, reviews them, and passes them to the merger even when the
new implementer iteration creates no commit.

Afterward, confirm merged branches are contained in `master`, expected issues
are closed, and no temporary containers or worktrees remain.

## Common Symptoms

| Symptom | Meaning | Action |
| --- | --- | --- |
| Root-owned workspace files | Missing mapped-UID ACL | Stop, repair, rerun doctor |
| `dubious ownership` | Container cannot trust linked worktree | Repair; do not add ad hoc paths |
| Agent clones into `/tmp` | Prepared worktree was unusable | Salvage commit, then fix runner |
| Repeated dependency installs | Agent escaped the prepared worktree/cache | Stop and inspect setup |
| Wrong image user | Image is stale or built by the wrong user | Rebuild as `claw` |

Agents must not run `git push`; Sandcastle owns commit synchronization. The
repository Codex hooks enforce the same rule.
