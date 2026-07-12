# Astro 7 guidance for coding agents

This repository uses Astro `7.0.6`, Bun, React islands, and static output. Astro 7's agent-oriented development features are available without changing `astro.config.mjs`; use them when a task needs a live preview. The release also changes compiler behavior, so generated `.astro` markup must be explicit and valid. See the [Astro 7 release notes](https://astro.build/blog/astro-7/).

## Consult current Astro documentation

Do not rely only on model memory for Astro APIs. Astro recommends its remote Docs MCP server because it indexes the current official documentation. The streamable HTTP endpoint is `https://mcp.docs.astro.build/mcp`; Astro's Codex example configures it in `~/.codex/config.toml` or the project `.codex/config.toml` with an `npx mcp-remote` proxy. In this Bun-only repository, use the equivalent `bunx mcp-remote` command if configuring that proxy. [Astro's AI guide documents the server and Codex setup](https://docs.astro.build/en/guides/build-with-ai/#codex-cli).

If MCP is unavailable, use Astro's generated, first-party text sets directly:

- [`llms.txt`](https://docs.astro.build/llms.txt) is the index; start here to choose the smallest relevant set.
- [`llms-small.txt`](https://docs.astro.build/llms-small.txt) is abridged framework guidance.
- [`_llms-txt/api-reference.txt`](https://docs.astro.build/_llms-txt/api-reference.txt) is the compact API reference.
- [`llms-full.txt`](https://docs.astro.build/llms-full.txt) is the complete documentation and should be loaded only when narrower sets are insufficient.

These feeds are generated from the official documentation, but they track the latest Astro release. Confirm that an API exists in pinned Astro `7.0.6` (look for the docs' “Added in” annotation or inspect installed types) before using newer guidance. MCP or text retrieval supplies context; it does not replace reviewing generated code and running the repository checks. [Astro explicitly requires review and testing of AI output](https://docs.astro.build/en/guides/build-with-ai/#usage).

## Run the dev server as an agent

Use Astro's managed background mode instead of starting a foreground process or inventing PID handling:

```sh
bun run astro dev --background
bun run astro dev status
bun run astro dev logs
bun run astro dev stop
```

`dev --background` waits until the server is ready, then detaches. Repeated starts return the existing instance, and `stop` succeeds when none is running. Astro records the URL, port, and PID in `.astro/dev.json`; never edit or commit that generated file. Agent detection may enable background mode and JSON logs automatically, but pass `--background` when deterministic behavior matters. Use `bun run astro dev --json` when a tool needs machine-readable foreground logs. [Astro 7 documents managed processes and JSON logging](https://astro.build/blog/astro-7/#ai-enhancements).

For a readiness check, request `http://localhost:<port>/_astro/status` and expect `{"ok":true}`. Read the actual port from the start/status output or `.astro/dev.json`; do not assume `4321`. The endpoint exists only in development. [Astro's AI guide specifies the lock file and health endpoint](https://docs.astro.build/en/guides/build-with-ai/#background-mode).

Always stop a background server after verification. For changes that do not require browser behavior, prefer the faster repository checks: `bun run typecheck`, `bun test`, and `bun run build`.

## Use the dev toolbar appropriately

The dev toolbar is enabled by default here because `astro.config.mjs` does not disable it. In a local browser preview, use:

- **Inspect** to verify React island props and hydration directives.
- **Audit** as a quick screen for common accessibility and performance issues.
- **Astro Menu → Copy debug info** when diagnosing an Astro-specific failure.

The toolbar is a browser UI, not an agent protocol, and it is not an Astro 7 AI enhancement. Headless agents gain nothing from it unless their browser tooling can interact with the rendered toolbar. Its audit is also not a substitute for dedicated accessibility/performance testing. Do not add a toolbar integration merely because a task is agent-authored. [The official toolbar guide describes its scope, built-ins, and limitations](https://docs.astro.build/en/guides/dev-toolbar/).

## Astro 7 coding constraints relevant here

- Close every element and attribute correctly. The Rust `.astro` compiler no longer repairs invalid HTML and now reports unclosed tags and unterminated attributes.
- Preserve intentional spaces between inline elements explicitly, for example `<span>Hello</span>{' '}<span>world</span>`, because Astro 7 uses JSX-style whitespace collapsing.
- Keep using the existing content collections and default Markdown processor. Do not add Satteri configuration, a unified/remark fallback, advanced routing, route caching, an adapter, or custom JSON logger unless the task actually requires one; none is needed for this static site.

These compiler and Markdown changes are described in the [Astro 7 compiler and processing notes](https://astro.build/blog/astro-7/#performance).
