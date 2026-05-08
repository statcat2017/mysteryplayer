# Spec: Data Contract For Matches, Players, And Puzzles

Status: Draft
Owner: Data Agent
Date: 2026-05-08

## Goal

Define the static data contract for the first playable Mystery Player puzzle so research, game logic, frontend, and QA agents can author, validate, render, and test daily puzzles consistently.

The first playable version uses one historical match, both teams' confirmed starting XIs, exactly 22 guessable starters hidden at launch, and one global text input for guesses.

## Background

`PROJECT_PLAN.md` calls for verified historical match data with generous player-name handling. `specs/001-game-rules.md` defines the current first-version rules:

- Each puzzle uses both teams from one historically meaningful match.
- Each team contributes exactly 11 confirmed starters.
- All 22 starters are hidden at launch and are guessable through one global text input.
- Substitutes are not playable answers in the first version.
- Position and formation context may be displayed, but the player never has to target a position when guessing.

The MP-002 task text mentions validation for "exactly 5 hidden starters." That is stale and conflicts with current MP-001. This contract follows MP-001 and requires exactly 22 hidden starters at launch.

## Assumptions

- Seed data will be static JSON stored in the repository until a later architecture ticket chooses tooling.
- The first version can duplicate compact team and player display data inside each puzzle file rather than requiring a normalized database.
- Player identities are unique within a puzzle, even if two players share similar display names.
- Positions and formations are display metadata only; they are never part of answer validation.
- Every guessable player should have exactly three usable hints in the order defined by MP-001.
- Hint 2 is conditional on match type, so each puzzle must identify whether the match is a club match or an international match.
- Source confidence is recorded at the field or object level where uncertainty could affect puzzle fairness.

## Requirements

- Represent one published daily puzzle as one self-contained record.
- Represent match metadata needed for the puzzle intro and post-game reveal.
- Represent both participating teams.
- Represent exactly 22 starter lineup entries, split as exactly 11 starters per team.
- Represent every starter as a guessable player slot hidden at launch.
- Represent accepted answer aliases for every guessable player.
- Represent hints for every guessable player.
- Represent source links, source notes, and confidence for match, lineup, player, and hint data.
- Define validation rules that can later become automated checks.
- Keep the contract framework-agnostic and independent of application code.

## Non-Goals

- Implementing validators, importers, answer matching, or frontend rendering.
- Choosing the final app stack, package manager, or runtime data loading approach.
- Modeling substitutes, managers, events, cards, goals, or substitution minutes for gameplay.
- Creating real seed puzzle content.
- Supporting accounts, server persistence, archives, analytics, or leaderboards.

## User Experience

The data contract must support the MP-001 experience:

- Before completion, the UI can show match context, both teams, and 22 hidden starter slots.
- The UI can show optional display context such as broad lineup group, shirt number, or formation label without requiring the user to guess by position.
- A correct global guess can reveal the matching player in the correct team and lineup location.
- Hints can be requested for any unrevealed player slot.
- Completion, give-up, and game-over states can reveal all player names without needing additional data.
- Share output can stay spoiler-free because all revealing match, team, lineup, player, and hint fields are separable from result metadata.

## Data And Logic

### Seed File Format

Initial seed data should use JSON files with stable camelCase keys.

Recommended layout until MP-004 chooses the app architecture:

```text
data/puzzles/YYYY-MM-DD.json
```

Each file should contain one puzzle record. A later ticket may move shared teams or players into normalized files, but the first playable version should prefer self-contained puzzle records to reduce lookup and provenance ambiguity.

Dates must use ISO 8601 calendar dates in `YYYY-MM-DD` format. Datetimes are not required for the first version.

### Top-Level Puzzle Record

Required fields:

- `schemaVersion`: string version for validation, initially `"1"`.
- `puzzleId`: stable unique ID, usually the daily date such as `"2026-05-08"`.
- `publishDate`: ISO date for the daily puzzle.
- `status`: `"draft"`, `"reviewed"`, or `"published"`.
- `match`: match object.
- `teams`: array of exactly two team objects.
- `players`: array of player objects referenced by lineup entries.
- `lineups`: array of exactly 22 lineup entry objects.
- `guessableSlots`: array of exactly 22 guessable slot objects.
- `sources`: array of source objects.

Optional fields:

- `puzzleNumber`: numeric public sequence if daily numbering is used.
- `difficulty`: author-assigned `"easy"`, `"medium"`, or `"hard"`.
- `editorNotes`: internal notes that must not be shown before post-game reveal.
- `review`: lightweight QA metadata such as reviewer and reviewed date.

### Match

Required fields:

- `id`: stable slug, for example `"2005-05-25-milan-liverpool"`.
- `date`: ISO match date.
- `competition`: competition name.
- `matchType`: `"club"` or `"international"`, used to validate hint 2.
- `homeTeamId`: team ID.
- `awayTeamId`: team ID.
- `score`: final score object.
- `sources`: source reference IDs supporting match metadata.
- `confidence`: `"high"`, `"medium"`, or `"low"`.

Optional fields:

- `stage`: round, final, semi-final, league matchday, or equivalent.
- `venue`: stadium name.
- `city`: match city.
- `country`: match country.
- `attendance`: numeric attendance when reliably sourced.
- `extraTime`: boolean.
- `penalties`: penalties score object when relevant.
- `context`: short post-game-safe description of why the match matters.
- `notes`: internal source or uncertainty notes.

### Team

Required fields:

- `id`: stable slug unique within the puzzle.
- `name`: display name.
- `side`: `"home"` or `"away"`.
- `sources`: source reference IDs supporting team identity in this match.
- `confidence`: `"high"`, `"medium"`, or `"low"`.

Optional fields:

- `shortName`: compact display name.
- `country`: team country.
- `crestKey`: future asset lookup key, not required for first playable data.
- `manager`: display-only manager name if useful and sourced.

### Player

Required fields:

- `id`: stable slug unique within the puzzle.
- `displayName`: canonical reveal name.
- `answerAliases`: array of accepted alias objects.
- `sources`: source reference IDs supporting identity and naming.
- `confidence`: `"high"`, `"medium"`, or `"low"`.

Optional fields:

- `fullName`: legal or fuller name if different from `displayName`.
- `shirtName`: name commonly displayed on shirt or broadcast graphics.
- `nationality`: display or hint value when reliably sourced.
- `clubAtMatchTime`: club the player represented at the time of the match, used for international-match hint 2 when reliably sourced.
- `dateOfBirth`: ISO date when useful for disambiguation.
- `notes`: naming, transliteration, accent, or source uncertainty notes.

### Answer Alias

Required fields:

- `value`: accepted user-entered answer text before normalization.
- `type`: `"fullName"`, `"surname"`, `"commonName"`, `"shirtName"`, `"unaccented"`, `"transliteration"`, or `"other"`.

Optional fields:

- `locale`: locale or language context when useful.
- `notes`: why the alias is accepted.

Alias normalization for validation should mirror MP-001 answer matching expectations: case-insensitive, accent-insensitive, punctuation-insensitive, and whitespace-normalized. Fuzzy or unrecorded near-miss matching is out of scope for the first version.

### Lineup Entry

Required fields:

- `id`: stable slot ID, for example `"home-01"` or `"away-11"`.
- `teamId`: team ID.
- `playerId`: player ID.
- `role`: must be `"starter"` for first playable data.
- `displayOrder`: integer from 1 to 11 within the team.
- `sources`: source reference IDs supporting the player appearing in the starting XI.
- `confidence`: `"high"`, `"medium"`, or `"low"`.

Optional fields:

- `shirtNumber`: integer when reliably sourced.
- `positionLabel`: source-backed position label such as `"GK"`, `"CB"`, or `"CM"`.
- `lineupGroup`: broad display grouping such as `"goalkeeper"`, `"defence"`, `"midfield"`, or `"attack"`.
- `formationSlot`: source-backed formation location when reliable.
- `captain`: boolean.
- `notes`: position, shirt number, or lineup-order uncertainty.

Lineup position fields are display metadata only. They do not constrain guesses.

### Guessable Slot

The "hidden slot" concept from earlier ticket wording maps to `guessableSlots` for the current 22-player global guessing model.

Required fields:

- `id`: stable guessable slot ID.
- `lineupEntryId`: referenced lineup entry.
- `playerId`: referenced player.
- `hiddenAtLaunch`: must be `true`.
- `hints`: array of hint objects.

Optional fields:

- `scoring`: per-player scoring overrides if later needed; omitted means use MP-001 default scoring.
- `difficultyNotes`: internal notes for puzzle review.

For first playable data, every starter must have exactly one corresponding guessable slot.

### Hint

Required fields:

- `order`: integer display order, starting at 1.
- `type`: `"alsoPlayedFor"`, `"nationality"`, `"clubAtMatchTime"`, `"firstName"`, or `"other"`.
- `text`: spoiler-controlled hint text.
- `sources`: source reference IDs supporting the hint.
- `confidence`: `"high"`, `"medium"`, or `"low"`.

Optional fields:

- `penaltyPoints`: numeric score penalty if overriding the MP-001 default.
- `notes`: internal uncertainty or wording notes.

Each guessable player should have exactly these three hints:

1. `alsoPlayedFor`: a sourced team, club, or national side the player also represented. It must not be either team in the match, must not already be visible elsewhere in the puzzle context, and should not duplicate that player's hint 2.
2. `nationality` for a club match, or `clubAtMatchTime` for an international match. For historical international puzzles, this means the sourced club at the time of the match, not a live current-club value that can drift over time.
3. `firstName`: the player's first name.

Hints must not contain the hidden player's full reveal name. A first-name hint may reveal only the first name because MP-001 explicitly allows that hint type.

### Source

Required fields:

- `id`: stable source ID used by references.
- `title`: human-readable source title.
- `url`: source URL.
- `publisher`: site, organization, book, archive, or database name.
- `accessedDate`: ISO date when the source was consulted.
- `sourceType`: `"official"`, `"database"`, `"matchReport"`, `"archive"`, `"book"`, or `"other"`.
- `confidence`: `"high"`, `"medium"`, or `"low"`.

Optional fields:

- `publishedDate`: ISO date when known.
- `author`: source author when relevant.
- `notes`: source quality notes, conflicts, or caveats.

At least one source should support each critical fact: match identity, match date, match type, final score, both team identities, every starter, every accepted naming decision that is not obvious, and every hint.

### Provenance And Confidence

Use confidence consistently:

- `high`: official source, multiple reputable sources agree, or the fact is uncontroversial and directly sourced.
- `medium`: reputable secondary source or minor disagreement that does not affect gameplay fairness.
- `low`: unresolved disagreement, weak source, or inferred value. Low-confidence data should block publication unless explicitly accepted by review.

Published puzzles should not contain low-confidence starting XI membership, player identity, or accepted answer data.

When sources conflict, keep the selected value in the main field, record the conflicting value in `notes`, and reference both sources.

### Validation Rules

A puzzle is invalid if any of these checks fail:

- `schemaVersion`, `puzzleId`, `publishDate`, `status`, `match`, `teams`, `players`, `lineups`, `guessableSlots`, and `sources` are present.
- `publishDate` and `match.date` are valid ISO dates.
- `match.matchType` is either `"club"` or `"international"`.
- `publishDate` is unique across the seed set.
- Exactly two teams are present.
- Match `homeTeamId` and `awayTeamId` reference the two teams.
- Exactly one team has `side: "home"` and exactly one has `side: "away"`.
- Exactly 22 lineup entries are present.
- Exactly 11 lineup entries with `role: "starter"` exist for each team.
- Exactly 22 guessable slots are present.
- Every starter lineup entry has exactly one guessable slot.
- Every guessable slot has `hiddenAtLaunch: true`.
- No substitute, bench, manager, or non-starter entry appears in `guessableSlots`.
- Every `teamId`, `playerId`, `lineupEntryId`, and source reference points to an existing object.
- Every player record is referenced by exactly one starter lineup entry for the first playable version.
- No two lineup slots reference the same `playerId`.
- No two players in one puzzle have the same normalized accepted alias unless an explicit future disambiguation rule exists.
- Every player has at least one accepted answer alias.
- Every guessable player has exactly three usable hints.
- Hint `order` values are unique per guessable slot.
- Hint 1 is `alsoPlayedFor`, does not name either match team, does not duplicate hint 2, and does not repeat a team already visible elsewhere in the puzzle context.
- Hint 2 is `nationality` when `match.matchType` is `"club"` and `clubAtMatchTime` when `match.matchType` is `"international"`.
- Hint 3 is `firstName`.
- Hint source references exist.
- Hints do not reveal full hidden player display names, except for allowed first-name content.
- `displayOrder` values are unique from 1 to 11 within each team.
- Position fields, when present, are used only for display and are not required for answer matching.
- Required source lists are non-empty for match, teams, players, lineup entries, and hints.
- Published records do not contain low-confidence starter identity, lineup membership, or accepted alias data.

The stale "exactly 5 hidden starters" requirement is intentionally not used. It should not appear in validators for the current first playable version.

### Compact Example

This fixture is intentionally partial and illustrative, not a real verified puzzle.

```json
{
  "schemaVersion": "1",
  "puzzleId": "2026-05-08",
  "publishDate": "2026-05-08",
  "status": "draft",
  "puzzleNumber": 1,
  "difficulty": "medium",
  "match": {
    "id": "2005-05-25-milan-liverpool",
    "date": "2005-05-25",
    "competition": "UEFA Champions League",
    "matchType": "club",
    "stage": "Final",
    "venue": "Ataturk Olympic Stadium",
    "homeTeamId": "milan",
    "awayTeamId": "liverpool",
    "score": { "home": 3, "away": 3 },
    "penalties": { "home": 2, "away": 3 },
    "context": "European final remembered for a major second-half comeback.",
    "sources": ["src-uefa-match"],
    "confidence": "high"
  },
  "teams": [
    {
      "id": "milan",
      "name": "Milan",
      "side": "home",
      "country": "Italy",
      "sources": ["src-uefa-match"],
      "confidence": "high"
    },
    {
      "id": "liverpool",
      "name": "Liverpool",
      "side": "away",
      "country": "England",
      "sources": ["src-uefa-match"],
      "confidence": "high"
    }
  ],
  "players": [
    {
      "id": "steven-gerrard",
      "displayName": "Steven Gerrard",
      "answerAliases": [
        { "value": "Steven Gerrard", "type": "fullName" },
        { "value": "Gerrard", "type": "surname" }
      ],
      "nationality": "England",
      "sources": ["src-uefa-match", "src-player-profile"],
      "confidence": "high"
    }
  ],
  "lineups": [
    {
      "id": "away-08",
      "teamId": "liverpool",
      "playerId": "steven-gerrard",
      "role": "starter",
      "displayOrder": 8,
      "shirtNumber": 8,
      "positionLabel": "CM",
      "lineupGroup": "midfield",
      "captain": true,
      "sources": ["src-uefa-match"],
      "confidence": "high"
    }
  ],
  "guessableSlots": [
    {
      "id": "slot-away-08",
      "lineupEntryId": "away-08",
      "playerId": "steven-gerrard",
      "hiddenAtLaunch": true,
      "hints": [
        {
          "order": 1,
          "type": "alsoPlayedFor",
          "text": "Also played for LA Galaxy.",
          "sources": ["src-player-profile"],
          "confidence": "high"
        },
        {
          "order": 2,
          "type": "nationality",
          "text": "Nationality: England.",
          "sources": ["src-player-profile"],
          "confidence": "high"
        },
        {
          "order": 3,
          "type": "firstName",
          "text": "First name: Steven.",
          "sources": ["src-player-profile"],
          "confidence": "high"
        }
      ]
    }
  ],
  "sources": [
    {
      "id": "src-uefa-match",
      "title": "UEFA match record",
      "url": "https://example.invalid/match-record",
      "publisher": "UEFA",
      "accessedDate": "2026-05-08",
      "sourceType": "official",
      "confidence": "high"
    },
    {
      "id": "src-player-profile",
      "title": "Player profile",
      "url": "https://example.invalid/player-profile",
      "publisher": "Official profile source",
      "accessedDate": "2026-05-08",
      "sourceType": "official",
      "confidence": "high"
    }
  ]
}
```

## Acceptance Criteria

- Given a research agent authors a first-playable puzzle, when they follow this spec, then the record contains one match, match type, two teams, 22 starters, 22 guessable slots, aliases, hints, sources, and puzzle metadata.
- Given a game logic agent reads a puzzle record, when a global guess is submitted, then the aliases provide deterministic matching across all 22 hidden starters.
- Given a frontend agent renders the puzzle, when the puzzle starts, then all 22 starter names can be hidden while team grouping and optional display context remain available.
- Given a QA agent validates seed data, when they apply the validation rules, then stale 5-hidden-player data is rejected and current 22-hidden-starter data is accepted.
- Given a source conflict exists, when the selected value is published, then the conflict and confidence are recorded in notes and source references.

## Verification

- Review this spec against `specs/001-game-rules.md` for the 22-player, global-input game model.
- Review against `review/checklist.md` data and research criteria.
- Confirm the compact example is structurally consistent with the field definitions, while noting it is intentionally partial.
- Future implementation tickets should turn the validation rules into automated checks before seed puzzles are published.

## Open Questions

- Should the final seed layout normalize shared teams and players after more than one puzzle exists?
- Should `displayOrder` follow source lineup order, formation order, shirt-number order, or an author-selected stable order when sources disagree?
- Should accepted aliases allow surname-only answers for every player, or only where there is no same-puzzle ambiguity?
- Should low-confidence non-critical fields, such as attendance or broad position grouping, be allowed in published puzzles with visible caveats?
