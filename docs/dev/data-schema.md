# Data Schema Companion

This is the implementation-facing companion to `specs/002-data-contract.md`. The spec is authoritative; this file is a compact reference for future validators, seed-data authors, and app agents.

## First-Playable Shape

Use one self-contained JSON file per daily puzzle until the app architecture says otherwise:

```text
data/puzzles/YYYY-MM-DD.json
```

Top-level required keys:

```text
schemaVersion
puzzleId
publishDate
status
match
teams
players
lineups
guessableSlots
sources
```

## Core Counts

- Exactly 2 teams.
- Exactly 11 starter lineup entries per team.
- Exactly 22 starter lineup entries total.
- Exactly 22 guessable slots.
- Every guessable slot has `hiddenAtLaunch: true`.
- Substitutes are not guessable in the first playable version.

The older "exactly 5 hidden starters" wording is stale and must not be used for current validators.

## Required Object Fields

Match:

```text
id, date, competition, homeTeamId, awayTeamId, score, sources, confidence
```

Team:

```text
id, name, side, sources, confidence
```

Player:

```text
id, displayName, answerAliases, sources, confidence
```

Answer alias:

```text
value, type
```

Lineup entry:

```text
id, teamId, playerId, role, displayOrder, sources, confidence
```

Guessable slot:

```text
id, lineupEntryId, playerId, hiddenAtLaunch, hints
```

Hint:

```text
order, type, text, sources, confidence
```

Source:

```text
id, title, url, publisher, accessedDate, sourceType, confidence
```

## Validation Priorities

Block publication when:

- A required object or field is missing.
- A date is not ISO `YYYY-MM-DD`.
- A referenced ID does not exist.
- Starter count is not 11 per team or 22 total.
- Guessable slot count is not 22.
- A starter has no guessable slot.
- A non-starter is guessable.
- A player record is not referenced by exactly one starter lineup entry.
- Two lineup entries reference the same player ID.
- Two players share a normalized accepted alias in the same puzzle.
- A guessable player has no accepted alias.
- A guessable player has no usable hint.
- A critical starter, lineup, player identity, or answer alias has low confidence.

Treat position, formation, shirt number, and lineup grouping as display-only fields. They must never be required for answer matching.
