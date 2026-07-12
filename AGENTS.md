# AGENTS.md

## Agent skills

### Sandcastle runner

- macOS runs through Docker Desktop using the current host UID/GID; no ACL repair is required.
- Linux uses the dedicated `/home/claw/ryanacevedo` checkout, rootless Docker, UID `1001`, GID `1002`, and inherited ACLs.
- Run `bun run sandcastle:doctor` before long runs. Do not work around permission failures with container root or ad hoc `/tmp` clones.
- Setup, repair, verification, and recovery: [`docs/agents/sandcastle-runner.md`](docs/agents/sandcastle-runner.md).

### Issue tracker

Issues are tracked as GitHub Issues on `rymanacevedo/ryanacevedo`, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary — the five canonical labels used as-is (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` plus `docs/adr/` at the repo root. See `docs/agents/domain.md`.
