# Backlog

Ordered tickets for the first pass toward a playable Mystery Player prototype.

## Assumptions

- The first implementation should prioritize one complete daily puzzle flow before broader content tooling.
- The web stack has not been chosen yet, so early specs should stay framework-agnostic.
- Seed content can start as static repository data, provided sources and confidence are recorded.
- The first puzzle format should be simple enough to validate manually before automation is added.

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

## MP-002: Data Contract For Matches, Players, And Puzzles

**Title:** Specify the seed data model and validation expectations

**Objective:** Define the static data structures needed to represent historical matches, teams, lineups, missing slots, aliases, sources, and puzzle metadata.

**Why It Matters:** Research, validation, game logic, and frontend rendering need the same contract before seed puzzles or answer checking can be implemented.

**Files Or Areas Likely Affected:**

- `specs/002-data-contract.md`
- `docs/dev/data-schema.md`
- `docs/dev/research-process.md`

**Dependencies:** MP-001.

**Acceptance Criteria:**

- Defines required and optional fields for match, team, player, lineup entry, answer alias, source, and puzzle records.
- Includes provenance and confidence requirements for match and player data.
- Describes file format expectations for seed data.
- Describes validation rules for missing players, duplicate players, aliases, positions, and dates.
- Includes at least one compact example record or fixture shape.

**Suggested Agent Role:** Data Agent / Spec Agent

## MP-003: Research Criteria And Seed Match Shortlist

**Title:** Create a sourced shortlist for initial puzzles

**Objective:** Establish the research standards and identify the first candidate historical matches for seed puzzle creation.

**Why It Matters:** The product depends on trustworthy, fair, historically meaningful content. A shortlist lets later agents create seed puzzles without deciding sourcing rules ad hoc.

**Files Or Areas Likely Affected:**

- `docs/dev/research-process.md`
- `docs/dev/source-quality.md`
- `docs/dev/seed-match-shortlist.md`

**Dependencies:** MP-001, MP-002.

**Acceptance Criteria:**

- Defines acceptable source types and how to record conflicting sources.
- Shortlists 10-15 candidate matches with dates, teams, competition, why the match matters, and source links.
- Flags likely difficulty and puzzle suitability for each match.
- Identifies 3-5 best candidates for first seed puzzle creation.

**Suggested Agent Role:** Research Agent

## MP-004: Stack Decision And App Architecture Spec

**Title:** Choose the initial web stack and implementation shape

**Objective:** Decide the first-version frontend/build/test stack and document how the app should be organized.

**Why It Matters:** Implementation should not start until agents know the framework, test runner, data loading approach, and deployment assumptions.

**Files Or Areas Likely Affected:**

- `specs/003-technical-architecture.md`
- `docs/dev/workflow.md`
- `README.md`

**Dependencies:** MP-001, MP-002.

**Acceptance Criteria:**

- Chooses the web framework, language, package manager, and test approach.
- Defines where app code, static data, tests, and validation scripts should live.
- Describes local development and build commands.
- Notes mobile/desktop and accessibility expectations for the first playable screen.
- Avoids installing dependencies or scaffolding code in this ticket.

**Suggested Agent Role:** Game Logic Agent / Frontend Agent / Spec Agent

## MP-005: First Seed Puzzle Content Pack

**Title:** Produce verified data for one playable puzzle

**Objective:** Convert one researched match into a complete, source-backed seed puzzle record using the approved data contract.

**Why It Matters:** A real fixture is needed to validate gameplay, answer normalization, UI layout, spoiler handling, and review workflow.

**Files Or Areas Likely Affected:**

- Seed data location defined by MP-002 and MP-004
- `docs/dev/seed-match-shortlist.md`
- `docs/dev/research-process.md`

**Dependencies:** MP-002, MP-003, MP-004.

**Acceptance Criteria:**

- Adds one complete match and puzzle record with all required fields.
- Includes verified starting lineup data and any substitute data required by the game rules.
- Includes answer aliases for hidden players.
- Records source links, source notes, and confidence.
- Identifies any unresolved data uncertainty for QA review.

**Suggested Agent Role:** Research Agent / Data Agent
