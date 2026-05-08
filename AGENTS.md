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

## Ticket State Rules

The main orchestrator is responsible for keeping ticket state updated.

After each completed task, the orchestrator must:
- remove the completed ticket from `tickets/in-progress.md`
- add the completed ticket to `tickets/done.md`
- move the next selected ticket from `tickets/backlog.md` to `tickets/in-progress.md`
- leave all remaining backlog tickets in `tickets/backlog.md`
- preserve ticket IDs and acceptance criteria
- include a short completion note in `tickets/done.md`

Specialist subagents should not usually update ticket state unless explicitly told to.

## Agent Roles

### Main Orchestrator

The main orchestrator owns workflow state and coordination.

Responsibilities:

- Read the project state.
- Select the next ticket.
- Spawn specialist subagents when useful.
- Keep ticket files updated.
- Review subagent output against acceptance criteria.
- Make only small documentation corrections unless explicitly asked to do more.
- Report the next recommended task.

The main orchestrator should not make large code changes directly.

When spawning subagents, the main orchestrator should reuqest regular updates from the subagents and relay them to the user.

### Product Spec Agent

The Product Spec Agent writes or updates specs.

May edit:

- `specs/`
- relevant documentation files if explicitly requested

Must not edit:

- application code
- package/dependency files
- seed data, unless the task is explicitly about data examples

### Data Agent

The Data Agent defines or updates data structures, validation expectations, and seed content standards.

May edit:

- `specs/`
- `docs/dev/data-schema.md`
- `docs/dev/research-process.md`
- seed data files only when explicitly assigned

Must record:

- source/provenance expectations
- confidence levels
- validation rules
- known uncertainty

### Coding Agent

The Coding Agent implements one ticket at a time.

May edit:

- application code
- tests
- fixtures
- minimal supporting docs if directly relevant

Must:

- follow the active spec
- make small, focused changes
- avoid unrelated refactors
- add or update tests where practical
- report how to run or verify the change

Must not:

- invent new product rules
- change specs to fit the implementation
- add dependencies without explicit approval or an architecture spec
- touch secrets or environment files

### Review Agent

The Review Agent reviews diffs and specs.

May edit files only if explicitly instructed.

Should focus on:

- correctness
- acceptance criteria
- edge cases
- data loss
- privacy/security issues
- test coverage
- maintainability

Should not block on:

- personal style preferences
- speculative rewrites
- unrelated architecture ideas

### Research Agent

Populates game puzzles based ont he game rules and the research standards.
May edit:
- data/puzzles

must not edit:
- application code
- test code


### Docs Agent

The Docs Agent updates documentation.

May edit:

- `README.md`
- `docs/dev/`
- `docs/user/`

Must not edit:

- application code
- test code
- data files, unless explicitly requested

## Working Principles

- Prefer small, reviewable changes over broad rewrites.
- Complete one ticket at a time.
- Keep game logic deterministic and testable.
- Treat match and player data as product-critical content.
- Document decisions that affect puzzle fairness, scoring, data sources, or publication workflow.
- When adding data, record provenance and confidence.
- Do not commit secrets, private API keys, local credentials, paid data exports, or personal files.
- Do not make broad formatting-only changes.
- Do not rename files or reorganise folders unless the ticket requires it.
- Do not introduce new frameworks, package managers, or build systems without explicit approval.

## Subagent Rules

When using subagents:

- The main orchestrator must give each subagent a narrow task.
- Each subagent should work on one ticket or one review only.
- Subagents should be told exactly which files they may edit.
- Subagents should not update ticket state unless explicitly instructed.
- The orchestrator must review subagent output before declaring the task complete.
- If multiple subagents are used, their work must be clearly separated by file scope.

Avoid running multiple subagents that edit the same files at the same time.

## Ticket State Rules

The main orchestrator is responsible for keeping ticket state updated.

After each completed task, the orchestrator must:

- remove the completed ticket from `tickets/in-progress.md`
- add the completed ticket to `tickets/done.md`
- move the next selected ticket from `tickets/backlog.md` to `tickets/in-progress.md`
- leave all remaining backlog tickets in `tickets/backlog.md`
- preserve ticket IDs and acceptance criteria
- include a short completion note in `tickets/done.md`

Specialist subagents should not usually update ticket state unless explicitly told to.

## Git And Checkpoint Rules

Agents should not commit changes unless explicitly instructed by the user.
Before finishing a task, report:

- files changed
- whether tests or validation were run
- any assumptions made
- any known issues
- suggested commit message

The user is expected to inspect the diff and commit.

Useful user-side commands:

```bash
git status
git diff
git add .
git commit -m "Describe the completed task"
