# Review Checklist

## Product

- The change supports the daily historical match guessing game.
- Rules, scoring, hints, or puzzle behavior are documented when changed.
- Spoilers are not revealed before submit, completion, or give-up states.

## Data And Research

- Match data has source links.
- Lineups are verified against reputable sources.
- Player names include useful aliases and accent-insensitive forms.
- Any uncertainty is documented.

## Game Logic

- Guess normalization handles case, accents, punctuation, and common variants.
- Correct and incorrect states are deterministic.
- Edge cases have tests where practical.
- Local progress, streaks, or results do not leak tomorrow's puzzle.

## Frontend

- The main puzzle is playable on mobile and desktop.
- Text fits inside controls and layout regions.
- Keyboard input and focus states are usable.
- Loading, completed, failed, and error states are handled.

## Engineering

- Changes are scoped to the ticket or spec.
- Tests, builds, linters, or validators have been run where relevant.
- New decisions are captured in docs or specs.
- No secrets, private exports, or irrelevant generated files are committed.
