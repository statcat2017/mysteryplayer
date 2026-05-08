# Data Model Draft

This is a working draft. Keep implementation schemas aligned with this document until a formal spec exists.

## Match

```json
{
  "id": "2005-05-25-liverpool-milan",
  "date": "2005-05-25",
  "homeTeamId": "milan",
  "awayTeamId": "liverpool",
  "competition": "UEFA Champions League",
  "stage": "Final",
  "venue": "Ataturk Olympic Stadium",
  "score": {
    "home": 3,
    "away": 3,
    "penalties": {
      "home": 2,
      "away": 3
    }
  },
  "sources": []
}
```

## Team

```json
{
  "id": "liverpool",
  "name": "Liverpool",
  "country": "England"
}
```

## Player

```json
{
  "id": "steven-gerrard",
  "displayName": "Steven Gerrard",
  "aliases": ["Gerrard", "Steven George Gerrard"],
  "nationality": "England"
}
```

## Lineup Entry

```json
{
  "matchId": "2005-05-25-liverpool-milan",
  "teamId": "liverpool",
  "playerId": "steven-gerrard",
  "role": "starter",
  "position": "CM",
  "shirtNumber": 8,
  "minuteOn": null,
  "minuteOff": null
}
```

## Puzzle

```json
{
  "id": "2026-05-08",
  "matchId": "2005-05-25-liverpool-milan",
  "hiddenPlayerIds": ["steven-gerrard"],
  "hints": {},
  "difficulty": "medium"
}
```

## Validation Ideas

- Every lineup entry references an existing match, team, and player.
- Every hidden player appears in the selected match.
- Every player has at least one accepted answer.
- Puzzle IDs are unique.
- Daily puzzle dates are valid ISO dates.
- Source list is non-empty for published matches.
