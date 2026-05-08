# In Progress

## MP-007: Core Gameplay State And Puzzle Flow

**Title:** Implement the first playable game loop

**Objective:** Build the deterministic gameplay state described in `specs/001-game-rules.md` on top of the new scaffold so the prototype behaves like a complete daily puzzle rather than a data-view shell.

**Why It Matters:** The app now loads and validates puzzle data, but it does not yet implement the actual rules that make Mystery Player playable. The next step is to turn the shell into the first end-to-end daily puzzle experience with correct guessing, lives, hints, completion, failure, and local progress.

**Files Or Areas Likely Affected:**

- `src/`
- `tests/`
- `README.md`

**Dependencies:** MP-001, MP-002, MP-004, MP-005, MP-006.

**Acceptance Criteria:**

- Implements global guessing behavior for all 22 hidden starters, including correct reveal handling, duplicate wrong-guess handling, and repeat correct-guess behavior per `specs/001-game-rules.md`.
- Implements five-life game-over behavior and prevents further guessing after completion, give-up, or game over.
- Implements per-slot hint usage with the three stored hints and applies deterministic score penalties from the rules spec.
- Implements completion, give-up, solved-count, attempts, lives-remaining, and final-score state in deterministic domain logic rather than UI-only handlers.
- Persists and restores current-puzzle progress in local storage keyed by puzzle ID or publish date.
- Adds or updates tests covering game-state transitions, scoring, and persistence boundaries where practical.
- Updates the UI shell so the puzzle is playable on mobile and desktop under the current first-version rules.

**Suggested Agent Role:** Game Logic Agent / Frontend Agent / QA Agent

**Status:** Selected as next implementation ticket.
