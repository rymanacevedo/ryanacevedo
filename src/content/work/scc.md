---
title: Second Chance Center
publishDate: 2025-07-25
img: /assets/scc-resume-app.png
img_alt: The SCC resume builder landing screen — "Create Your Professional Resume"
description: |
  An AI resume application for a reentry nonprofit — concept to production in a fixed-scope two-week sprint, solo.
tags:
  - AI
  - LLMs
  - OpenAI
  - React
  - Netlify
---

- **Engagement:** Direct client — fixed-scope two-week sprint
- **Role:** AI Product Engineer
- **Dates:** July 2025
- **Team:** Solo

## The problem

Second Chance Center is a Colorado nonprofit that helps formerly incarcerated people transition back into society — and for their client partners, a resume is one of the first walls between them and a job. Producing one was slow, manual work: resume review used to take staff about a week of back-and-forth per client, and staff time was the bottleneck on how many people SCC could serve.

## Engagement and role

This engagement is the literal shape of my AI Product Sprint offer: fixed scope, two weeks, solo, concept to production. I started by sitting with SCC's staff — asking their client partners questions, watching how the organization actually works — and then built the tool that fit the workflow they already had, rather than a workflow the tool demanded.

## Constraints

- Two weeks, fixed scope — no runway for iteration theater.
- Solo: design, build, and deployment on one pair of hands.
- The users are staff and client partners, not technologists — the tool had to be simpler than the process it replaced.

## What shipped

- **A guided resume builder.** A client partner and a staff member go from a blank screen to a finished resume in one sitting, instead of a week of drafts passing back and forth.
- **AI-powered writing.** OpenAI-backed generation turns a client's history into professional resume copy — the AI integrated where it saves staff time, not as a gimmick.
- **Word and PDF export.** Staff hand clients a file employers actually accept.
- **Production, not prototype.** Deployed and in daily use, with in-app issue reporting so staff can flag problems directly.

## Verified result

- **900+ resumes generated** per OpenAI usage logs since launch.
- Resume review that used to take staff an estimated week of back-and-forth per client now happens in a single sitting.

> Ryan came, sat down, and got to work. He asked our client partners questions and watched how we work as an organization. From there, he built the resume app we use and integrated AI into the product to help us work more efficiently. He did all of this in a matter of two weeks!
>
> — Kyle Fowler, Director of Employee Engagement, Second Chance Center

## Evidence

- [The live application](https://sccc.netlify.app) — it's a client-rendered app, so the screenshot above shows what a crawler can't.
- The usage figure comes from the application's OpenAI usage/API logs.
