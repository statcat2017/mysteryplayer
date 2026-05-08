# Project Plan

## Product Vision

Mystery Player is a daily football history game where users complete missing players from the lineup of a notable match from the past.

The game should feel quick, fair, and satisfying:

- A new puzzle every day.
- A historically meaningful match.
- Missing players are guessable from clues, position, team, era, and context.
- Spelling and name variants are handled generously.
- Spoilers are avoided until the player submits or gives up.

## Core Loop

1. User opens today's puzzle.
2. They see match context and a lineup with missing players.
3. They type guesses into hidden slots.
4. Correct guesses reveal players.
5. The game tracks completion, attempts, hints, and result sharing.

## Initial Rule Questions

- How many missing players per puzzle?
- Are substitutes included?
- Are hints always available, limited, or penalized?
- Does a guess apply globally or only to the selected slot?
- Should near misses be accepted automatically or suggested?
- Should the puzzle use one team, both teams, or vary by day?
- How should scoring balance speed, guesses, hints, and completion?

## Milestones

1. Agree the first version of the game rules.
2. Choose the web stack.
3. Define match and player data schemas.
4. Create seed puzzles from verified historical matches.
5. Build the first playable daily puzzle.
6. Add validation, tests, and daily publishing workflow.

## Agent Roles

- Product Agent: clarifies rules, scoring, difficulty, UX, and daily puzzle format.
- Research Agent: identifies notable matches, verifies lineups, sources, aliases, and metadata.
- Data Agent: shapes match/player schemas, validation, normalization, and content import.
- Game Logic Agent: owns puzzle generation, answer checking, scoring, streaks, and state.
- Frontend Agent: owns the playable interface, responsive design, accessibility, and polish.
- QA Agent: writes tests, checks edge cases, and verifies puzzle quality before release.
