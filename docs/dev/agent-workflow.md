# Agent Workflow

## Operating Loop

Use this loop for substantial work:

1. Orient: read `README.md`, `AGENTS.md`, `PROJECT_PLAN.md`, relevant specs, and nearby code.
2. Plan: identify the smallest useful outcome and any risks.
3. Act: make focused edits.
4. Verify: run tests, builds, linters, or data validators.
5. Record: update specs, tickets, docs, or decisions when the work changes project direction.

## Working Principles

- Prefer small, reviewable changes over broad rewrites.
- Keep game logic deterministic and testable.
- Treat match and player data as product-critical content.
- Document decisions that affect puzzle fairness, scoring, data sources, or publication workflow.
- When adding data, record provenance and confidence.

## Handoff Expectations

Product work should produce rules, UX flows, and acceptance criteria.

Research work should produce candidate matches, verified lineups, source links, confidence notes, and known name variants.

Data work should produce schemas, import scripts, validation checks, and normalization rules.

Game logic work should produce puzzle generation, guess validation, scoring, and persistence behavior.

Frontend work should produce responsive, accessible, playable interfaces.

QA work should produce tests, validation reports, and regression checks.
