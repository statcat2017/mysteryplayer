# In Progress

## MP-001: First-Version Game Rules Spec

**Title:** Define the first playable daily puzzle rules

**Objective:** Turn the open product questions in `PROJECT_PLAN.md` into a concrete first-version rules spec.

**Why It Matters:** Game logic, data shape, scoring, hints, and UI all depend on stable rules. This is the main blocker for implementation agents.

**Files Or Areas Likely Affected:**

- `specs/001-game-rules.md`
- `PROJECT_PLAN.md` if milestone wording needs a small clarification
- `review/checklist.md` only if the review criteria need a rule-specific addition

**Dependencies:** None.

**Acceptance Criteria:**

- Defines number of missing players per puzzle.
- Defines whether one team, both teams, or a fixed first-version scope is used.
- Defines substitute handling.
- Defines guess behavior, including slot-specific versus global matching.
- Defines hint availability and any scoring impact.
- Defines completion, give-up, attempts, and share-result behavior at a product level.
- Lists open questions that can safely remain unresolved after the first playable version.

**Suggested Agent Role:** Product Agent / Spec Agent

**Status:** Ready for spec agent.
