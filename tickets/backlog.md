# Backlog

Ordered tickets for the first pass toward a playable Mystery Player prototype.

## MP-010: Seed Backlog And Publication QA

**Title:** Build an initial publish-ready backlog of reviewed puzzle content

**Acceptance Criteria:**

- Adds an initial backlog of roughly 10-20 reviewed puzzles in `data/puzzles/`.
- Ensures each queued puzzle meets published confidence and validation requirements.
- Records provenance and any non-critical caveats cleanly for each puzzle.
- Adds or updates a lightweight QA checklist or validation step for publish-ready puzzle content.
- Avoids tests that are unnecessarily coupled to one specific historical match.

## MP-011: Static Hosting And Deployment Workflow

**Title:** Prepare the first public static deployment

**Acceptance Criteria:**

- Chooses the first static hosting target for the public prototype.
- Adds the required deployment configuration and documented release steps.
- Ensures the production build serves correctly on the chosen host, including asset-path behavior.
- Verifies the app can be loaded directly at the production URL without broken refresh behavior.
- Adds a short production-readiness checklist for deploys.

## MP-012: Pre-Publish QA, Accessibility, And Cross-Device Pass

**Title:** Run a focused release-quality QA pass before public launch

**Acceptance Criteria:**

- Verifies the main puzzle flow on common desktop and mobile viewport sizes.
- Fixes remaining critical layout, keyboard, focus, and readable-contrast issues.
- Confirms that guessing, hints, terminal states, and reset behavior remain usable across supported layouts.
- Adds a concise manual QA checklist for release candidates.
- Keeps the game playable without viewport-breaking layout shifts or hidden controls.

## MP-013: Daily Publishing Operations And Archive Policy

**Title:** Define the operational workflow for daily releases and old puzzles

**Acceptance Criteria:**

- Documents how new puzzles are prepared, reviewed, and promoted every 24 hours.
- Defines the operator workflow for publication, rollback, and missed-day handling.
- Decides whether archived puzzles remain playable after their daily window.
- Defines how unpublished, draft, and future-dated puzzles are treated in the live app.
- Records these decisions in developer-facing docs where future agents can follow them.

## MP-014: Post-Launch Analytics And Failure Monitoring

**Title:** Add lightweight visibility into live puzzle health after first publish

**Acceptance Criteria:**

- Defines a minimal approach for monitoring production failures or broken daily selection.
- Adds a lightweight strategy for observing deploy health and obvious client-side errors.
- Documents what signals are needed to confirm the correct puzzle is live each day.
- Avoids introducing a heavy backend or account system.
- Keeps the solution compatible with a static-hosted first release.
