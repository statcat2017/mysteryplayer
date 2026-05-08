# Mystery Player

A daily football history guessing game where players fill in the missing footballers from a notable match lineup.

## Project Status

The repository now includes the first playable prototype scaffold:

- Vite + React + TypeScript + npm app shell
- Build-time puzzle loading from `data/puzzles/*.json`
- Runtime validation for the MP-002 puzzle contract
- Global alias-based starter reveal for the current daily seed
- Vitest coverage for normalization, matching, and validation

Full game-state rules such as lives, scoring, hints penalties, and persistence are still separate follow-on work.

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
- The current shell selects the puzzle matching the local date when available, then falls back to the latest available seed for local development.

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
