# ADR 0001: Use category-based blog URLs

- Status: Accepted
- Date: 2026-07-12
- Decision source: GitHub issues #58 and #70

## Context

The blog previously derived URLs from year folders as `/blog/posts/[year]/[slug]`. Years were content-storage details rather than useful reader navigation, and one article's folder year did not match the year in its title. Publish dates were also absent from rendered pages.

## Decision

Blog posts use `/blog/[category]/[slug]` URLs. The first folder below `src/content/posts/` is the post category and is the single source of truth; category frontmatter is not added.

The launch vocabulary is deliberately limited to `ai-engineering`, `infrastructure`, and `tooling`. Route generation validates every content ID against this allowlist, so an unknown category fails the build.

Publish dates appear on blog cards and post pages, but dates do not form part of URLs. The three former year-based URLs redirect permanently through Astro's static redirect configuration.

## Consequences

- Categories are stable, buyer-oriented public URL segments rather than incidental year folders.
- Adding a category requires an explicit code change and review before content in that folder can build.
- Existing inbound links continue to resolve through redirects.
- Future URL migrations must preserve redirects for published locations.
