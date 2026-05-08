# Spec: Technical Architecture

Status: Draft
Owner: Technical Architecture Spec Agent
Date: 2026-05-08

## Goal

Choose the first-version web stack and implementation shape for Mystery Player so future implementation agents can build the playable daily puzzle without re-deciding framework, language, testing, data loading, or repository layout.

The architecture should support the current product rules: one historical match per puzzle, both teams' confirmed starting XIs, all 22 starters hidden at launch, one global text input accepts names for any player, no position-specific guessing, and substitutes are not playable.

## Background

`PROJECT_PLAN.md` calls for a quick, fair, daily football history game. `specs/001-game-rules.md` defines the first playable rules, and `specs/002-data-contract.md` defines static JSON puzzle records with source-backed match, team, player, lineup, guessable slot, hint, and provenance data.

The first implementation does not need accounts, server persistence, backend APIs, content management, leaderboards, or a full publishing system. It does need deterministic game logic, source-backed static data, mobile and desktop playability, and enough tests to protect answer matching, scoring, and seed-data validity.

## Assumptions

- The first playable version can ship as a static web app.
- Static repository JSON is enough for seed puzzles until publication tooling is designed.
- The app can determine the current daily puzzle from `publishDate` using the user's local date for the prototype.
- The repository may eventually hold a backlog of many authored puzzle JSON files, with the frontend selecting one puzzle every 24 hours from that set.
- The repository can start with standard npm scripts even before dependencies are installed.
- A future implementation ticket may scaffold the selected stack, but this ticket only documents decisions.

## Requirements

- Use a browser-first web stack suitable for a static daily puzzle.
- Use TypeScript for game logic, data access, and React components.
- Use npm as the package manager.
- Keep core game logic deterministic and testable outside the UI.
- Load seed puzzle data from the JSON shape defined in `specs/002-data-contract.md`.
- Support local progress persistence keyed by puzzle ID or publish date.
- Provide a test strategy for game logic, data validation, and basic UI behavior.
- Define a repository layout future agents can scaffold into.
- Document expected local commands, without installing dependencies or creating executable scripts in this ticket.
- Preserve accessibility and responsive expectations for mobile and desktop.

## Non-Goals

- Installing dependencies.
- Running `npm create`, scaffolding framework files, or writing application code.
- Implementing game logic, data validators, seed data, UI components, styling, or deployment.
- Choosing a backend, database, authentication provider, analytics service, or CMS.
- Designing the final visual brand.
- Defining a full daily publishing workflow beyond static data loading expectations.

## Stack Decision

### Web Framework

Use **Vite + React** for the first playable version.

Rationale:

- Mystery Player's first version is an interactive single-page game and does not need server rendering.
- Vite keeps the development and build setup small for a static app.
- React is a common fit for stateful UI with forms, revealed slots, hint controls, completion states, and responsive layout.
- The stack can deploy as static assets to GitHub Pages, Netlify, Vercel static output, or similar hosting without changing product logic.

Avoid Next.js or Remix for the first version because routing, server actions, API routes, and deployment-specific server behavior are unnecessary for the current scope.

### Language

Use **TypeScript** for all app code, validation code, and tests.

Rationale:

- The puzzle data contract has many cross-referenced IDs and state transitions that benefit from typed structures.
- Game scoring, answer normalization, hint penalties, and local persistence should be deterministic and easy to test.
- TypeScript types can mirror the JSON contract while still allowing runtime validation for seed data.

### Package Manager

Use **npm**.

Rationale:

- It is available by default with Node.js.
- It is sufficient for a small Vite app.
- It avoids introducing additional package-manager setup before the project needs it.

Future agents should commit `package-lock.json` when dependencies are first installed.

## User Experience

The first playable screen should be the game itself, not a marketing landing page.

Expected screen structure:

- Match context region with date, competition, stage, teams, score, and short significance text where allowed by spoiler rules.
- Two team lineup regions with 11 hidden starter slots each.
- One prominent global guess input that accepts a name for any hidden starter.
- Lives, solved count, score, attempts, and hints-used summary.
- Hint controls attached to unrevealed player slots.
- Completion, give-up, and game-over summary states.
- Spoiler-free share result once the puzzle is complete, given up, or failed.

Responsive expectations:

- Mobile should support comfortable one-handed text entry and scanning of 22 slots.
- Desktop should show both teams efficiently without forcing horizontal scrolling.
- The layout must not depend on precise formation positions; positions and shirt numbers are optional display metadata only.
- Text must fit inside controls and slot regions at common mobile and desktop widths.

Accessibility expectations:

- The global guess input must have a visible label.
- Form submission must work by keyboard.
- Revealed-player, wrong-guess, hint-used, completion, give-up, and game-over feedback should be announced through accessible status text.
- Buttons must have clear names and focus states.
- Color must not be the only indicator of solved, unsolved, hinted, failed, or revealed states.
- Post-game share text must be selectable and copyable without requiring pointer-only interaction.

## Data And Logic

### Static Seed Data Loading

Use the MP-002 file shape as the source of truth:

```text
data/puzzles/YYYY-MM-DD.json
```

Each JSON file contains one self-contained puzzle record with the fields defined in `specs/002-data-contract.md`.

Recommended first implementation shape:

- Keep raw authored seed files in `data/puzzles/`.
- Add TypeScript domain types in `src/domain/puzzleTypes.ts`.
- Add runtime data validation in `src/domain/validatePuzzle.ts`.
- Add a Vite-compatible loader in `src/data/puzzleLoader.ts` using `import.meta.glob` to include JSON puzzle files at build time.
- Pick the current puzzle by exact `publishDate`; if no matching date exists, fall back to the latest published puzzle for local development only.
- Never fetch live remote match or player data in the first playable version.

Publication validation should fail if any current MP-002 rules fail, especially:

- Not exactly two teams.
- Not exactly 11 starters per team.
- Not exactly 22 starter lineup entries.
- Not exactly 22 guessable slots.
- Any starter lacks one guessable slot.
- Any guessable player lacks accepted aliases or usable hints.
- Any substitute or non-starter is playable.
- Any critical starter, lineup membership, player identity, or accepted alias is low confidence.

### Game Logic Modules

Keep game logic independent from React components.

Expected modules:

- `src/domain/normalizeAnswer.ts`: lowercases, removes accents, normalizes punctuation and whitespace.
- `src/domain/matchGuess.ts`: matches a normalized global guess against unrevealed player aliases.
- `src/domain/gameState.ts`: initializes state, applies correct guesses, wrong guesses, duplicate guesses, hints, give-up, game-over, and completion.
- `src/domain/scoring.ts`: applies MP-001 per-player scoring, hint penalties, and final score.
- `src/domain/shareResult.ts`: generates spoiler-free share output.
- `src/storage/localProgress.ts`: persists and restores per-puzzle state in local storage.

React components should call these modules rather than embedding rules in component event handlers.

### Persistence

Use browser `localStorage` for first-version progress.

Storage expectations:

- Key progress by puzzle ID or publish date.
- Persist revealed slots, normalized incorrect guesses, remaining lives, hints used by slot, completion state, give-up state, game-over state, and final score.
- Treat stored data as recoverable cache. If puzzle schema or ID changes, the app may discard incompatible progress.
- Do not store tomorrow's puzzle data or anything that could reveal future answers.

### Repository Layout

Future implementation agents should use this layout unless a later spec changes it:

```text
data/
  puzzles/
    YYYY-MM-DD.json
docs/
  dev/
  user/
review/
specs/
src/
  app/
    App.tsx
    main.tsx
  components/
    GuessInput.tsx
    LineupBoard.tsx
    PlayerSlot.tsx
    HintControls.tsx
    ScoreSummary.tsx
    ShareResult.tsx
  data/
    puzzleLoader.ts
  domain/
    gameState.ts
    matchGuess.ts
    normalizeAnswer.ts
    puzzleTypes.ts
    scoring.ts
    shareResult.ts
    validatePuzzle.ts
  storage/
    localProgress.ts
  styles/
    global.css
tests/
  domain/
  data/
  ui/
```

Keep `data/` outside `src/` so authored puzzle content remains clearly separate from application code. The app may import those files at build time through Vite.

## Test Approach

Use **Vitest** for fast TypeScript unit tests.

Game logic tests should cover:

- Answer normalization for case, accents, punctuation, and whitespace.
- Alias matching through one global input across all 22 hidden starters.
- Correct guess reveal behavior.
- Repeat correct guesses and duplicate wrong guesses.
- Five-life game-over behavior.
- Hint usage and per-player score penalties.
- Give-up and completion scoring.
- Spoiler-free share output.

Use **runtime schema validation tests** for static data.

Recommended approach:

- Implement validation with a TypeScript-friendly runtime schema library such as Zod when dependencies are added.
- Add tests that load every `data/puzzles/*.json` file and assert MP-002 validation rules.
- Keep source-confidence checks in the validator so low-confidence critical facts block published records.

Use **React Testing Library with Vitest** for basic UI behavior.

UI tests should cover:

- The first playable screen renders match context, two team regions, 22 hidden slots, and one global guess input.
- Submitting a valid name reveals the correct slot.
- Submitting a wrong unique name loses one life.
- Hint controls expose hint text and update scoring state.
- Completion, give-up, and game-over states disable further guessing.
- Prefer generic fixtures or derived assertions over naming one specific published match unless the behavior under test genuinely depends on that fixture's unique data.

Use **Playwright** later for one or two end-to-end smoke tests once the UI exists:

- Mobile viewport can load and complete a small test puzzle.
- Desktop viewport can submit guesses, use a hint, and display spoiler-free share text.
- End-to-end checks for daily selection should validate loader and `publishDate` behavior against a multi-puzzle seed backlog, not by assuming one hard-coded match is always today's puzzle.

## Local Commands

Future implementation agents should add these npm scripts when the app is scaffolded:

```text
npm run dev
npm run build
npm run preview
npm run test
npm run test:watch
npm run test:ui
npm run validate:data
```

Expected meanings:

- `dev`: start the Vite dev server.
- `build`: typecheck and build static assets.
- `preview`: preview the production build locally.
- `test`: run unit, data, and component tests once.
- `test:watch`: run Vitest in watch mode.
- `test:ui`: run Playwright smoke tests when present.
- `validate:data`: validate every seed puzzle JSON file without building the UI.

Do not add these scripts until dependencies and scaffold files are intentionally created in a later implementation ticket.

## Acceptance Criteria

- Given the architecture spec, when a future implementation agent starts MP-004 follow-up work, then they know to use Vite, React, TypeScript, and npm.
- Given the architecture spec, when seed-data loading is implemented, then the source data lives in `data/puzzles/YYYY-MM-DD.json` and follows MP-002.
- Given the architecture spec, when game logic is implemented, then answer matching, scoring, hints, state transitions, and share output are isolated from React components.
- Given the architecture spec, when tests are added, then game logic, data validation, and basic UI behavior have clear test categories.
- Given the architecture spec, when the first screen is built, then it preserves MP-001's 22-player global-guess rules and works on mobile and desktop.
- Given this ticket's scope, when reviewed, then no dependencies, scaffold files, or application code have been added.

## Verification

- Product review confirms the architecture preserves MP-001: one match, both starting XIs, 22 hidden starters, global name input, no position requirement, and no playable substitutes.
- Data review confirms static data loading follows `specs/002-data-contract.md` and `docs/dev/data-schema.md`.
- Engineering review confirms the selected stack is specific enough for implementation without requiring a backend.
- QA review confirms the test approach covers deterministic game logic, seed data validation, and core UI states.
- Repository review confirms this ticket changed documentation only.

## Open Questions

- Which static host will be used for the first public prototype?
- Should the first daily puzzle selection use the user's local date or a fixed publication timezone?
- Should validation use Zod, Valibot, or a custom lightweight validator once dependencies are installed?
- Should authored puzzle JSON be imported directly by Vite or copied into `public/` during build for easier inspection?
- When should Playwright become required rather than optional smoke coverage?
