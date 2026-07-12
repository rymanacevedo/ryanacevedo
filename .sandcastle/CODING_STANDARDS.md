# Coding Standards

## Tooling

- Use Bun for packages and scripts. Prefer `bun run <script>` and `bunx`.
- Do not run the development server unless the task requires browser verification.
- Before committing, run lint, typechecking, tests, and the production build.

## Architecture

- Use Astro for pages, layouts, routing, content, and static presentation.
- Use React only for interactive islands that need client-side state.
- Keep reusable UI in `src/components/`, layouts in `src/layouts/`, shared logic in `src/lib/`, and global tokens in `src/styles/global.css`.
- Put static passthrough assets in `public/`.

## TypeScript and React

- Prefer explicit domain types at public boundaries and discriminated unions for exclusive states.
- Normalize unknown thrown values before surfacing error messages.
- Prefer named function declarations for React components; do not use `React.FC`.
- Test behavior through public interfaces rather than implementation details.

## Styling and Content

- Reuse the CSS custom properties and layout utilities in `src/styles/global.css`.
- Preserve responsive behavior and both light and dark themes.
- Keep content metadata compatible with the existing Astro content collections.

## Documentation

- Keep agent documentation concise and operational.
- Follow `AGENTS.md`, `CONTEXT.md` when present, and relevant ADRs under `docs/adr/`.
