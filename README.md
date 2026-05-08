# Mystery Player

A daily football history guessing game where players fill in the missing footballers from a notable match lineup.

## Project Status

The repository now includes the first playable prototype:

- Vite + React + TypeScript + npm app
- Build-time puzzle loading from `data/puzzles/*.json`
- Runtime validation for the MP-002 puzzle contract
- Deterministic game state for guesses, lives, hints, completion, give-up, and game over
- Local progress persistence keyed by puzzle ID
- Spoiler-safe post-game share output
- Vitest coverage for normalization, matching, validation, scoring, state transitions, and persistence

The current prototype is functionally playable. Visual polish, production-grade interaction design, and deeper UI test coverage are still follow-on work.

## Local Development

Use Node.js 20+.

Install dependencies:

```bash
npm install
```

Start the Vite dev server:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Build the production bundle:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Prototype Notes

- Puzzle seed files live in `data/puzzles/`.
- The app loads those JSON files through the build with `import.meta.glob`, not a remote fetch.
- The runtime validator enforces core counts and cross-references before the puzzle is rendered.
- The app selects the puzzle matching the local date when available, then falls back to the latest available seed for local development.
- Progress is stored locally, so refreshing the page preserves the current puzzle session for the same puzzle ID.

## Key Files

- `AGENTS.md`: shared instructions for agents working in this repo.
- `PROJECT_PLAN.md`: product vision, milestones, and role breakdown.
- `data/puzzles/`: authored daily puzzle seed files.
- `specs/000-template.md`: template for feature specs.
- `src/`: app scaffold, domain logic, loader, and UI shell.
- `tests/`: Vitest coverage for puzzle-domain rules.
- `docs/dev/`: developer and research documentation.
- `docs/user/`: user-facing documentation.
- `tickets/`: backlog, active work, and completed work.
- `review/checklist.md`: review checklist.
