# Mystery Player Agent Guide

## First Files To Read

Before starting substantial work, read:

1. `PROJECT_PLAN.md`
2. The relevant file in `specs/`
3. The active ticket in `tickets/in-progress.md`
4. `review/checklist.md`

## Project Shape

- `PROJECT_PLAN.md`: product direction, milestones, and agent roles.
- `specs/`: feature specs and implementation contracts.
- `docs/dev/`: developer-facing notes, schemas, workflows, and research process.
- `docs/user/`: user-facing product explanations and help content.
- `tickets/`: backlog, active work, and completed work.
- `review/`: review and QA checklists.

## Working Principles

- Prefer small, reviewable changes over broad rewrites.
- Keep game logic deterministic and testable.
- Treat match and player data as product-critical content.
- Document decisions that affect puzzle fairness, scoring, data sources, or publication workflow.
- When adding data, record provenance and confidence.
- Do not commit secrets, private API keys, or paid data exports.

## Definition Of Done

A change is done when:

- The intended user behavior is implemented or documented.
- Relevant tests or validation checks pass.
- New assumptions are captured in docs or comments where useful.
- Content changes include sources or provenance.
- The game remains playable on mobile and desktop.
