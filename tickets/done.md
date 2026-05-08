# Done

Completed tickets are recorded here with a short note on what was shipped or documented.

## MP-001: First-Version Game Rules Spec

**Title:** Define the first playable daily puzzle rules

**Acceptance Criteria:**

- Defines number of missing players per puzzle.
- Defines whether one team, both teams, or a fixed first-version scope is used.
- Defines substitute handling.
- Defines guess behavior, including slot-specific versus global matching.
- Defines hint availability and any scoring impact.
- Defines completion, give-up, attempts, and share-result behavior at a product level.
- Lists open questions that can safely remain unresolved after the first playable version.

**Completion Note:** Completed via [specs/001-game-rules.md](/Users/ben/mysteryplayer/specs/001-game-rules.md:1), which resolves puzzle scope, global guessing, lives, hints, scoring, give-up flow, and spoiler-free sharing for the first playable version.

## MP-002: Data Contract For Matches, Players, And Puzzles

**Title:** Specify the seed data model and validation expectations

**Acceptance Criteria:**

- Defines required and optional fields for match, team, player, lineup entry, answer alias, source, and puzzle records.
- Includes provenance and confidence requirements for match and player data.
- Describes file format expectations for seed data.
- Describes validation rules for missing players, duplicate players, aliases, positions, and dates.
- Includes at least one compact example record or fixture shape.

**Completion Note:** Completed via [specs/002-data-contract.md](/Users/ben/mysteryplayer/specs/002-data-contract.md:1) and [docs/dev/data-schema.md](/Users/ben/mysteryplayer/docs/dev/data-schema.md:1), which define the JSON contract, provenance expectations, and validation rules for match, team, player, lineup, guessable slot, hint, and source records.

## MP-003: Research Criteria And Seed Match Shortlist

**Title:** Create a sourced shortlist for initial puzzles

**Acceptance Criteria:**

- Defines acceptable source types and how to record conflicting sources.
- Shortlists 10-15 candidate matches with dates, teams, competition, why the match matters, and source links.
- Flags likely difficulty and puzzle suitability for each match.
- Identifies 3-5 best candidates for first seed puzzle creation.

**Completion Note:** Completed via [docs/dev/research-process.md](/Users/ben/mysteryplayer/docs/dev/research-process.md:1), [docs/dev/source-quality.md](/Users/ben/mysteryplayer/docs/dev/source-quality.md:1), and [docs/dev/seed-match-shortlist.md](/Users/ben/mysteryplayer/docs/dev/seed-match-shortlist.md:1), which define sourcing standards and shortlist 15 candidate matches with the strongest first-seed recommendations.

## MP-004: Stack Decision And App Architecture Spec

**Title:** Choose the initial web stack and implementation shape

**Acceptance Criteria:**

- Chooses the web framework, language, package manager, and test approach.
- Defines where app code, static data, tests, and validation scripts should live.
- Describes local development and build commands.
- Notes mobile/desktop and accessibility expectations for the first playable screen.
- Avoids installing dependencies or scaffolding code in this ticket.

**Completion Note:** Completed via [specs/003-technical-architecture.md](/Users/ben/mysteryplayer/specs/003-technical-architecture.md:1), which selects `Vite + React + TypeScript + npm`, defines repository layout, and documents the test and loading approach for the first playable app.

## MP-005: First Seed Puzzle Content Pack

**Title:** Produce verified data for one playable puzzle

**Acceptance Criteria:**

- Adds one complete match and puzzle record with all required fields.
- Includes verified starting lineup data and any substitute data required by the game rules.
- Includes answer aliases for hidden players.
- Records source links, source notes, and confidence.
- Identifies any unresolved data uncertainty for QA review.

**Completion Note:** Completed via [data/puzzles/2026-05-08.json](/Users/ben/mysteryplayer/data/puzzles/2026-05-08.json:1), which adds one complete Argentina vs France 2022 World Cup Final seed puzzle with 22 players, 22 starter lineup entries, 22 guessable slots, aliases, hints, source links, and recorded draft-stage caveats for later validator and QA review.

## MP-006: Playable Prototype Scaffold And Data Validation

**Title:** Scaffold the app and validate puzzle data

**Acceptance Criteria:**

- Scaffolds the app using the stack chosen in `specs/003-technical-architecture.md` (`Vite + React + TypeScript + npm`).
- Adds TypeScript puzzle domain types aligned with `specs/002-data-contract.md`.
- Adds runtime puzzle validation for the current seed file, including cross-reference and core count checks.
- Loads puzzle JSON from `data/puzzles/` through the app build rather than remote fetch.
- Includes tests for answer-normalization-adjacent data rules where relevant and for seed puzzle validation.
- Documents the local install, dev, test, and build commands in `README.md`.
- Leaves the repo with a running app shell that can load the current daily puzzle data, even if full gameplay interactions are still incomplete.

**Completion Note:** Completed via the new Vite/React/TypeScript scaffold, puzzle loader, runtime validator, and test suite in `src/`, `tests/`, and `README.md`. Verified locally with `npm test` and `npm run build`, both passing on 2026-05-08.

## MP-007: Core Gameplay State And Puzzle Flow

**Title:** Implement the first playable game loop

**Acceptance Criteria:**

- Implements global guessing behavior for all 22 hidden starters, including correct reveal handling, duplicate wrong-guess handling, and repeat correct-guess behavior per `specs/001-game-rules.md`.
- Implements five-life game-over behavior and prevents further guessing after completion, give-up, or game over.
- Implements per-slot hint usage with the three stored hints and applies deterministic score penalties from the rules spec.
- Implements completion, give-up, solved-count, attempts, lives-remaining, and final-score state in deterministic domain logic rather than UI-only handlers.
- Persists and restores current-puzzle progress in local storage keyed by puzzle ID or publish date.
- Adds or updates tests covering game-state transitions, scoring, and persistence boundaries where practical.
- Updates the UI shell so the puzzle is playable on mobile and desktop under the current first-version rules.

**Completion Note:** Completed via the new `src/domain/gameState.ts`, `src/domain/scoring.ts`, `src/storage/localProgress.ts`, playable app integration in `src/app/` and `src/components/`, and expanded tests in `tests/domain/` and `tests/ui/`. Verified locally with `npm test` and `npm run build`, both passing on 2026-05-08.
