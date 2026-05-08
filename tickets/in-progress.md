# In Progress

## MP-009: Multi-Puzzle Loader And Daily Rotation

**Title:** Support a backlog of authored puzzles and select the correct daily puzzle

**Acceptance Criteria:**

- Loads multiple authored puzzle files from `data/puzzles/`.
- Selects the active puzzle by `publishDate` from the available backlog.
- Defines and implements the publication timezone rather than relying on implicit local-date behavior.
- Handles future-dated puzzles, missing dates, and local-development fallback behavior deterministically.
- Adds tests for daily selection behavior against a multi-puzzle backlog without hard-coding one historical match.

**Note:** Selected as the next ticket, but not yet started.
