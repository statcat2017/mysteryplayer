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
- A "lineup" means both teams' confirmed starting XIs unless a later spec explicitly expands the scope.

## Requirements

- Each daily puzzle uses one historically meaningful football match.
- Each puzzle includes both teams' confirmed starting XIs from that match.
- Each puzzle hides all 22 starting players at launch.
- Substitutes are not playable answers in the first version.
- Guesses are entered through one global text input and are valid for every hidden player on both teams.
- A correct guess reveals that player in the lineup and shows their team and lineup location.
- A wrong guess loses one life. When five lives are lost, the game is over.
- Hints are available for each hidden player and reduce the maximum score for that player.
- Attempts, hints, completion, give-up, and share-result behavior are tracked for the current daily puzzle.
- Share results must be spoiler-free and must not reveal match identity, team, player names, or hints.

## Non-Goals

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
- The importance of the game if not obvious, such as a last game at a stadium or a player's debut.
- The two teams.
- Final score and attendance.
- Both teams' lineups to be completed.
- Twenty-two player slots, all hidden at launch.

Games should never repeat.

### Hidden Slots

Each hidden slot may show structural context to make the puzzle fair without requiring the user to target a specific position:

- Team grouping.
- Broad lineup area or formation location when reliably sourced.
- Shirt number when reliably sourced.
- Optional short clue metadata exposed through hints, not by default.

The user never has to choose a specific position before guessing. Position, formation, or shirt-number context is display-only and should not be required for answer matching.

If a source does not provide reliable formation positions, the puzzle should use a simple team list or broad defensive/midfield/attacking grouping rather than inventing a precise formation.

### Guessing

The user submits a player name guess in one global text input.

Guess behavior:

- Matching is global across all 22 hidden starters.
- A correct guess reveals every matching hidden player identity. In normal valid data this should reveal exactly one player.
- Already revealed names cannot be used to fill additional players, and lives are not lost for repeat correct guesses.
- Repeating the same normalized incorrect guess should not cost another life.
- A player identity may only appear once per puzzle unless a future data contract explicitly supports duplicate-name disambiguation.

Name matching should be generous but deterministic:

- Case-insensitive.
- Accent-insensitive.
- Ignore punctuation and extra whitespace.
- Accept known aliases recorded in puzzle data.
- Accept common short forms when recorded as aliases.
- Do not automatically accept unrecorded fuzzy matches in the first version.

Near misses may be shown as generic feedback, but the first playable version does not need "Did you mean..." suggestions.

### Attempts

Attempts are counted for the whole puzzle.

An attempt is any submitted guess that is not a duplicate normalized incorrect guess and not a repeat of an already revealed player.

The player starts with 5 lives. Each counted incorrect guess removes one life. The player can continue guessing until all 22 players are revealed, they give up, or all 5 lives are lost.

### Hints

Each hidden player has 3 ordered hints.

Hint order:

1. Also played for...
2. Nationality or club at match time, depending on match type.
3. First name...

Hint 1, "Also played for", must name a team, club, or national side the player also represented that is not otherwise mentioned in the visible puzzle context or in that player's other hints. It must not be either team in the match, and it should not duplicate the second hint.

Hint 2 depends on the match type:

- For a club match, hint 2 is the player's nationality.
- For an international match, hint 2 is the player's club at the time of the match. For historical puzzles, store the sourced club at match time rather than a live "current club" value that could drift over time.

Hint 3 is the player's first name.

Hint behavior:

- Hints are requested for an unrevealed player slot in the displayed lineup.
- Hints remain visible after being used.
- Using a hint reduces the maximum score available for that player.
- The player can complete the puzzle after using any number of hints.

### Scoring

The first version uses a transparent points score rather than a timer-based score.

Each hidden player starts worth 10 points:

- First hint used for that player: minus 2 points.
- Second hint used for that player: minus 2 additional points.
- Third hint used for that player: minus 2 additional points.
- Global incorrect guesses reduce remaining lives but do not directly reduce points.
- A player cannot be worth less than 2 points if eventually solved before game over or give up.
- A player is worth 0 points if revealed by giving up or game over.

Puzzle score is the sum of the 22 hidden-player scores, with a maximum of 220.

The score is deterministic and does not depend on speed, local timezone, or input timing.

### Completion

The puzzle is complete when all 22 hidden players are revealed by correct guesses before the player gives up or loses all lives.

On completion, the UI may reveal:

- Total counted attempts.
- Hints used.
- All player names.
- A spoiler-free share result.

Completion should be persisted locally for the daily puzzle so refreshing the page does not reset progress.

### Give Up

The user may give up at any time.

Giving up:

- Reveals all remaining hidden players.
- Marks unsolved hidden players as 0 points.
- Ends the puzzle.
- Shows the same post-game summary as completion, clearly marked as gave up.
- Disables further guessing for that day's puzzle.

Give-up state should be persisted locally for the daily puzzle.

### Share Result

The share result must be spoiler-free.

It may include:

- Product name.
- Puzzle date or puzzle number.
- Score out of 220.
- Number solved out of 22.
- Attempts count.
- Lives remaining or failed state.
- Hints used count.
- A compact per-player result grid using non-spoiler symbols.

It must not include:

- Match teams.
- Competition.
- Final score.
- Player names.
- Positions or lineup ordering that would identify hidden players.
- Hint text.

Example shape:

```text
Mystery Player #12
score / max possible
x/22 solved
Attempts: 25 | Lives: 2 | Hints: 2
[][][][][][][][][][][]
[][][][][][][][][][]
```

The exact symbols can be refined by the frontend agent, provided they remain spoiler-free and readable.

## Data And Logic

### Puzzle Scope

Each puzzle record needs enough data to support:

- One match.
- Both teams.
- Both teams' confirmed starting XIs.
- Exactly 22 hidden starters.
- Source-backed player names.
- Aliases for all guessable players.
- Hint data for each guessable player.
- Match type, so hint 2 can be validated as nationality for club matches or club at match time for international matches.

### Authoring Rules

Puzzle authors should choose matches whose full starting XIs are fair for the target audience.

For the first version, a fair puzzle should generally use a match where:

- Several players across both teams are widely recognizable.
- The match context helps users infer less famous players.
- Displayed lineup labels help rather than mislead.
- Alias coverage for accents, common name variants, and shirt-name variants.
- Source notes for any disputed lineup, position, shirt number, or attendance.

### State Rules

The game should track these values for the current daily puzzle:

- Revealed hidden slots.
- Counted incorrect attempts globally.
- Remaining lives.
- Normalized incorrect guesses, used to avoid duplicate life loss.
- Hints used per hidden player.
- Completion state.
- Give-up state.
- Game-over state after 5 lost lives.
- Final score when completed or given up.

State should be keyed by puzzle ID or puzzle date so progress does not leak across days.

### Validation Rules

A puzzle is invalid if:

- It does not have exactly 11 starters for each team.
- It does not hide exactly 22 starters at launch.
- Two lineup slots resolve to the same player identity.
- A guessable player has no accepted answer form.
- A guessable player does not have exactly 3 usable hints in the required order.
- Hint 1 repeats either match team, repeats hint 2, or names a team already visible elsewhere in the puzzle context.
- Hint 2 is not nationality for a club match or club at match time for an international match.
- Hint 3 is not the player's first name.
- A team or required match context is missing.

## Acceptance Criteria

- Given a new daily puzzle, when it loads, then the user sees both teams' starting XIs with all 22 player names hidden.
- Given the global guess input, when the user submits an accepted answer for any hidden starter, then that player is revealed in the correct team and lineup location.
- Given the global guess input, when the user submits an incorrect non-duplicate answer, then one life is lost.
- Given a repeated normalized incorrect guess, when the user submits it again, then no additional life is lost.
- Given a user requests a hint, when the hint is available for an unrevealed player, then the hint is shown and that player's maximum score is reduced.
- Given all 22 players are solved before give-up or game over, when the final answer is accepted, then the puzzle is marked complete and a spoiler-free share result is available.
- Given a user gives up, when confirmation is accepted, then all remaining players are revealed, unsolved players receive 0 points, and further guesses are disabled.
- Given a user loses the fifth life, when the game enters game over, then all remaining players are revealed, unsolved players receive 0 points, and further guesses are disabled.
- Given a generated share result, when inspected before or after sharing, then it does not reveal match identity, team names, player names, positions, lineup order, or hint text.

## Verification

- Product review confirms all MP-001 acceptance criteria are covered.
- Data review confirms the required puzzle inputs are sufficient for MP-002 to define schemas.
- Game logic review confirms answer matching, attempts, hints, scoring, completion, and give-up can be implemented deterministically.
- Frontend review confirms the described states can be rendered on mobile and desktop.
- QA review confirms edge cases are testable without relying on timers or external services.

## Open Questions

- Should later versions include substitutes, unused bench players, or substitution-minute clues?
- Should unrecorded fuzzy matching suggest near misses after the first playable version?
- Should speed, streaks, or first-try bonuses affect scoring in later versions?
- Should difficulty labels be assigned by author judgment or calculated from player fame, hints, and attempts?
- Should the final score display include percentile or community comparison after analytics exist?
- Should archived puzzles be playable after the daily window?
