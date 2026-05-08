# Spec: First-Version Game Rules

Status: Draft
Owner: Product Agent
Date: 2026-05-08

## Goal

Define the first playable version of Mystery Player's daily puzzle rules so data, game logic, frontend, and QA agents can build against one shared behavior contract.

The first version should be quick to play, deterministic to validate, and simple enough to ship with hand-verified static puzzle data.

## Background

Mystery Player is a daily football history game where users complete missing players from the lineup of a notable match from the past.

`PROJECT_PLAN.md` leaves several first-version rule questions open: number of missing players, substitute handling, hint behavior, guess matching, puzzle scope, and scoring. This spec resolves those questions for the first playable prototype.

## Assumptions

- The first playable version should optimize for a complete, fair daily puzzle flow over complex scoring.
- Initial puzzles can be generated manually from verified historical match data.
- The first UI should work without accounts, server-side identity, or cross-device sync.
- Persistent local progress is useful but streaks and long-term stats can wait until after the first playable version.
- A "lineup" means the confirmed starting XI unless a later spec explicitly expands the scope.

## Requirements

- Each daily puzzle uses one historically meaningful football match.
- Each puzzle focuses on one selected team's confirmed starting XI from that match.
- Each puzzle hides exactly 5 players from that selected team's starting XI.
- The remaining 6 starters are visible from the start, along with match context.
- Substitutes are not playable answers in the first version.
- Guesses are entered against a selected hidden slot.
- A correct guess reveals that slot's player.
- A guess for the right player in the wrong hidden slot does not complete the selected slot.
- Hints are available for each hidden slot and reduce the maximum score for that slot.
- Attempts, hints, completion, give-up, and share-result behavior are tracked for the current daily puzzle.
- Share results must be spoiler-free and must not reveal match identity, team, player names, or hints.

## Non-Goals

- Both-team puzzles.
- Variable missing-player counts by difficulty.
- Substitute guessing or bench reconstruction.
- Account-based progress, cross-device sync, leaderboards, streaks, or historical archives.
- Automatic near-miss suggestions.
- Final balancing of long-term scoring, difficulty ratings, or competitive ranking.
- Data schema details beyond what game rules require.

## User Experience

### Puzzle Start

When the user opens today's puzzle, they see:

- Match date.
- Competition.
- Round or stage when known.
- The two teams.
- Final score when it does not make the hidden players trivially obvious.
- The selected team whose lineup is being completed.
- Eleven lineup slots for the selected team.
- Six revealed starters.
- Five hidden starters.

The selected team should be chosen by the puzzle author. The author should prefer the team whose hidden players create the fairest and most interesting puzzle.

### Hidden Slots

Each hidden slot should show enough structural context to make the puzzle fair without revealing the answer:

- Position or role label, such as `GK`, `RB`, `CB`, `CM`, `FW`, or a source-backed formation role.
- Shirt number when reliably sourced.
- Optional short clue metadata exposed through hints, not by default.

If a source does not provide reliable formation positions, the puzzle may use a simpler ordered lineup with broad position groups.

### Guessing

The user chooses a hidden slot and submits a player name guess for that slot.

Guess behavior:

- Matching is slot-specific.
- A correct guess for the selected slot reveals that player.
- A correct player guessed in the wrong slot counts as an incorrect attempt for the selected slot.
- Already revealed names cannot be used to fill hidden slots.
- Repeating the same normalized incorrect guess for the same slot should not add another attempt.
- Repeating the same normalized incorrect guess for a different slot may count for that different slot.
- A player may only appear once in a selected team's starting XI.

Name matching should be generous but deterministic:

- Case-insensitive.
- Accent-insensitive.
- Ignore punctuation and extra whitespace.
- Accept known aliases recorded in puzzle data.
- Accept common short forms when recorded as aliases.
- Do not automatically accept unrecorded fuzzy matches in the first version.

Near misses may be shown as generic feedback, but the first playable version does not need "Did you mean..." suggestions.

### Attempts

Attempts are counted per hidden slot and for the whole puzzle.

An attempt is any submitted guess that is not a duplicate normalized incorrect guess for the same slot.

There is no hard attempt limit in the first version. The player can continue guessing until all hidden players are revealed or they give up.

### Hints

Each hidden slot has up to 2 hints.

Hint order:

1. Nationality.
2. Club at the time of the match, when reliably sourced. If club-at-match-time is unavailable or ambiguous, use age on match day instead.

Hint behavior:

- Hints are requested per slot.
- Hints do not reveal player names, initials, or aliases.
- Hints remain visible after being used.
- Using a hint reduces the maximum score available for that slot.
- A player can complete the puzzle after using any number of hints.

### Scoring

The first version uses a transparent points score rather than a timer-based score.

Each hidden slot starts worth 100 points:

- First hint used for that slot: minus 20 points.
- Second hint used for that slot: minus 20 additional points.
- Each counted incorrect attempt for that slot: minus 10 points.
- A slot cannot be worth less than 20 points if eventually solved without giving up.
- A slot is worth 0 points if revealed by giving up.

Puzzle score is the sum of the five hidden-slot scores, with a maximum of 500.

The score is deterministic and does not depend on speed, local timezone, or input timing.

### Completion

The puzzle is complete when all 5 hidden players are revealed by correct guesses.

On completion, the UI may reveal:

- Final score.
- Total counted attempts.
- Hints used.
- All hidden player names.
- A spoiler-free share result.

Completion should be persisted locally for the daily puzzle so refreshing the page does not reset progress.

### Give Up

The user may give up at any time.

Giving up:

- Reveals all remaining hidden players.
- Marks unsolved hidden slots as 0 points.
- Ends the puzzle.
- Shows the same post-game summary as completion, clearly marked as gave up.
- Disables further guessing for that day's puzzle.

Give-up state should be persisted locally for the daily puzzle.

### Share Result

The share result must be spoiler-free.

It may include:

- Product name.
- Puzzle date or puzzle number.
- Score out of 500.
- Number solved out of 5.
- Attempts count.
- Hints used count.
- A compact per-slot result grid using non-spoiler symbols.

It must not include:

- Match teams.
- Competition.
- Final score.
- Selected team.
- Player names.
- Positions that would identify hidden players.
- Hint text.

Example shape:

```text
Mystery Player #12
420/500
5/5 solved
Attempts: 8 | Hints: 2
[][][][][]
```

The exact symbols can be refined by the frontend agent, provided they remain spoiler-free and readable.

## Data And Logic

### Puzzle Scope

Each puzzle record needs enough data to support:

- One match.
- One selected team.
- That team's confirmed starting XI.
- Exactly 5 hidden starters.
- Source-backed visible and hidden player names.
- Aliases for hidden players.
- Hint data for each hidden player.
- Whether each hint is available, unavailable, or substituted with the fallback age-on-match-day hint.

### Authoring Rules

Puzzle authors should choose hidden players that are fair for the target audience.

For the first version, a fair puzzle should generally include:

- At least 2 widely recognizable hidden players.
- No more than 1 highly obscure hidden player unless the match context strongly supports the answer.
- Position labels that help rather than mislead.
- Alias coverage for accents, common name variants, and shirt-name variants.
- Source notes for any disputed lineup or position.

### State Rules

The game should track these values for the current daily puzzle:

- Revealed hidden slots.
- Counted incorrect attempts per slot.
- Normalized incorrect guesses per slot, used to avoid duplicate attempt inflation.
- Hints used per slot.
- Completion state.
- Give-up state.
- Final score when completed or given up.

State should be keyed by puzzle ID or puzzle date so progress does not leak across days.

### Validation Rules

A puzzle is invalid if:

- It does not have exactly 11 starters for the selected team.
- It does not hide exactly 5 starters.
- A hidden player is also displayed as a revealed starter.
- Two lineup slots resolve to the same player identity.
- A hidden player has no accepted answer form.
- A hidden player has fewer than 1 usable hint.
- The selected team or match context is missing.

## Acceptance Criteria

- Given a new daily puzzle, when it loads, then the user sees one selected team's starting XI with exactly 5 hidden players and 6 revealed players.
- Given a hidden slot, when the user submits a matching accepted answer for that slot, then that slot reveals the player and awards points according to attempts and hints used for that slot.
- Given a hidden slot, when the user submits a correct answer for another hidden slot, then the selected slot remains hidden and the guess counts as an incorrect attempt for the selected slot.
- Given a repeated normalized incorrect guess for the same slot, when the user submits it again, then the slot does not gain another counted attempt.
- Given a user requests a hint, when the hint is available for that slot, then the hint is shown and that slot's maximum score is reduced.
- Given all hidden slots are solved, when the final answer is accepted, then the puzzle is marked complete and a spoiler-free share result is available.
- Given a user gives up, when confirmation is accepted, then all remaining players are revealed, unsolved slots receive 0 points, and further guesses are disabled.
- Given a generated share result, when inspected before or after sharing, then it does not reveal match identity, team names, player names, positions, or hint text.

## Verification

- Product review confirms all MP-001 acceptance criteria are covered.
- Data review confirms the required puzzle inputs are sufficient for MP-002 to define schemas.
- Game logic review confirms answer matching, attempts, hints, scoring, completion, and give-up can be implemented deterministically.
- Frontend review confirms the described states can be rendered on mobile and desktop.
- QA review confirms edge cases are testable without relying on timers or external services.

## Open Questions

- Should future puzzles support both teams or vary the selected side by day?
- Should later versions include substitutes, unused bench players, or substitution-minute clues?
- Should unrecorded fuzzy matching suggest near misses after the first playable version?
- Should speed, streaks, or first-try bonuses affect scoring in later versions?
- Should difficulty labels be assigned by author judgment or calculated from player fame, hints, and attempts?
- Should the final score display include percentile or community comparison after analytics exist?
- Should archived puzzles be playable after the daily window?
