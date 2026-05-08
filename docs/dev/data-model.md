# Data Model Draft

Status: Superseded reference only.

This draft has been superseded by the formal data contract in `specs/002-data-contract.md` and the implementation-facing companion in `docs/dev/data-schema.md`.

Use those documents as the source of truth for current seed data and validation work.

## Current First-Playable Shape

- One self-contained JSON puzzle record per daily puzzle.
- One historical match per puzzle.
- Exactly two teams.
- Exactly 11 confirmed starters per team.
- Exactly 22 starter lineup entries total.
- Exactly 22 guessable slots, all hidden at launch.
- One global guess input accepts names for any hidden starter.
- Positions, formation slots, shirt numbers, and lineup groups are display-only metadata.
- Substitutes are not playable answers in the first version.

## Authoritative References

- `specs/001-game-rules.md`: product rules.
- `specs/002-data-contract.md`: full data contract.
- `docs/dev/data-schema.md`: concise schema and validation reference.
