---
title: Clyde AI
publishDate: 2026-06-12
img: /assets/clyde-platform.png
img_alt: Clyde AI logo
description: |
  Embedded AI engineer on a three-person startup team — five LangGraph agents, eval-driven CI, and an autonomous AI development loop, from onboarding to launched MVP in nine weeks.
tags:
  - AI
  - LLMs
  - TypeScript
  - GCP
  - Firebase
  - LangGraph
---

- **Engagement:** Direct client — embedded contract
- **Role:** AI Engineer
- **Dates:** January – June 2026
- **Team:** 3 engineers — the CTO, me, and a junior engineer

## The problem

Clyde is an AI-powered decision platform for solo consultants — not another chatbot, but a facilitator that runs the room: structured brainstorms, idea organization, voting, trade-off analysis, and decision capture, guided by a bench of specialized AI advisors who participate in the session rather than just answering questions.

The business problem was the one every funded AI startup faces: an ambitious multi-agent product, a three-person team, and a timeline with no room for AI features that demo well and fail quietly in production. Consultants would be running live client sessions on this platform — the agents had to be dependable, not just plausible.

## Engagement and role

I embedded with Clyde's team as their AI engineer from January through June 2026, working alongside the CTO and a junior engineer. The engagement ran in two phases: onboarding into a nine-week build to MVP launch, and then a re-engagement after launch to migrate the inherited repo to an AI-tooling-friendly setup — so the dev team could keep shipping with AI agents after I rolled off.

## Constraints

- Nine weeks from onboarding to a launchable MVP.
- Three engineers to build, test, and operate a multi-agent product end to end.
- Live client sessions meant agent behavior had to be guaranteed, not hoped for — a wrong turn mid-session isn't a bug report, it's a lost consultant.
- The codebase had to stay coherent at that speed, or velocity would collapse right after launch.

## What shipped

- **Five LangGraph agents on one architecture.** Intake, session facilitation, trade-off analysis, decision capture, and voting — unified on a single shared turn-result envelope instead of fragmented agent-specific responses. Critical product behavior routes through deterministic, pure-function gates, so it's guaranteed in code rather than left to prompts. New agents plug in without schema duplication or bespoke wiring.
- **The AI advisor system.** Persona-driven advisors that respond in their own voice through private one-on-one threads, surface proactive insights mid-brainstorm and at activity milestones, and ground their thinking in the documents users upload.
- **An autonomous AI development loop.** Sandboxed infrastructure — isolated git worktrees and Docker environments — where AI coding agents safely author changes, run the full test and eval suite, and open draft pull requests for human review. This turned AI-assisted development from a novelty into the team's daily workflow.
- **Evaluation and trust infrastructure.** Scenario-based evals run against the live agents on every commit, nightly regression tracking, and automatic issue filing when behavior drifts. LLM output handling hardened end to end: validation, sanitization, and schema-enforced structured outputs, so model text can never smuggle side effects into the product.
- **Full-stack delivery.** React Router v7 surfaces for live collaborative activities, Firestore real-time subscriptions with hardened error handling, and Cloud Functions on GCP orchestrating everything from document ingestion to session export.
- **Post-launch re-engagement.** Migrated the inherited repo to an AI-tooling-friendly setup for the dev team — the same development loop I used, made durable, so the whole team ships with AI agents rather than one specialist.

## Verified result

- **MVP built and launched in nine weeks**, with **five LangGraph agents** in production.
- **Core session prompt compressed by roughly 40%**, measured via token counts, with every security guardrail preserved.
- **Iteration time cut by an estimated 5–10×** — the team's estimate — once the AI development loop became the daily workflow. A three-person team shipping with the throughput of a much larger one.

<!-- Client quote: pending — warm ask to Clyde's CTO (see issue #92). Slots in here when it lands. -->

## Evidence

- [meetclyde.com](https://meetclyde.com) — the live platform.
- The 5–10× acceleration figure is published with Clyde's sign-off; the prompt-compression figure comes from before/after token counts.
