---
title: Clyde AI
publishDate: 2026-06-12
img: /assets/clyde-platform.png
img_alt: Clyde AI logo
description: |
  Shipped a multi-agent AI decision platform for consultants in nine weeks — five LangGraph agents, eval-driven CI, and an autonomous AI development loop.
tags:
  - AI
  - LLMs
  - TypeScript
  - GCP
  - Firebase
  - LangGraph
---

Solo consultants don't need another chatbot — they need a thought partner that can actually run the room. Clyde is an AI-powered decision platform that facilitates real consulting work: structured brainstorms, idea organization, voting, trade-off analysis, and decision capture, all guided by a bench of specialized AI advisors who participate in the session rather than just answering questions. I made major contributions across the core agent and orchestration layers during the nine-week build, helping the team deliver an ambitious platform on a compressed timeline.

## Key Projects and Contributions

- **Multi-Agent Orchestration Architecture**: I designed and unified five LangGraph agents — intake, session facilitation, trade-off analysis, decision capture, and voting — onto a single shared turn-result envelope, replacing fragmented agent-specific responses with one composable schema. The orchestrator routes every turn through deterministic, pure-function gates (intake framing, disambiguation overlays, clarification triggers), so critical product behavior is guaranteed in code rather than hoped for in prompts. New agents plug into the platform without schema duplication or bespoke wiring.

- **AI Advisor System**: I built and refined the advisor experience that makes Clyde feel like a team instead of a tool — persona-driven advisors that respond in their own voice through private one-on-one threads, surface proactive insights mid-brainstorm and at activity milestones, and ground their thinking in the documents users upload. Advisor recommendations are context-driven, proposed from the user's stated challenge and materials rather than a static menu.

- **Autonomous AI Development Loop**: My highest-leverage contribution wasn't a feature — it was the factory. I designed and built sandboxed development infrastructure (isolated git worktrees and Docker environments) where AI coding agents could safely author changes, run the full test and eval suite, and open draft pull requests for human review. This turned AI-assisted development from a novelty into the team's daily workflow, cutting iteration time by an estimated 5–10x and letting a tiny team ship with the throughput of a much larger one.

- **Evaluation and Trust Infrastructure**: AI products fail quietly, so I made quality loud. I helped build a scenario-based evaluation system that runs contract and behavioral evals against the live agents on every commit, tracks nightly regression history, and automatically files GitHub issues when behavior drifts. On the safety side, I hardened LLM output handling — validation, sanitization, and schema-enforced structured outputs — so model text can never smuggle side effects into the product, and compressed the core session prompt by roughly 40% while preserving every security guardrail.

- **Single-Source-of-Truth Architecture**: I drove the canonicalization of session state — the user's goal captured once at intake, stored durably, and projected into every agent's context through one shared read path. The same discipline shaped activity completion (one module owns closure and outcome derivation for every activity type) and turn provenance (every persisted message records which agent authored it). Backed by a strong architectural decision record practice, these patterns kept a fast-moving codebase coherent instead of chaotic.

- **Full-Stack Delivery**: Beyond the agent layer, I shipped across the stack — React Router v7 frontend surfaces for live collaborative activities, Firestore real-time subscriptions with hardened error handling, and Cloud Functions on GCP orchestrating everything from document ingestion to session export.

Clyde taught me what AI-native engineering actually looks like: rigorous architecture and evaluation discipline aren't overhead that slows AI work down — they're the reason a tiny team can ship an enterprise-grade multi-agent product in nine weeks. Build the guardrails, build the factory, and the velocity takes care of itself.
