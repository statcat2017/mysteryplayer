# Source Quality

This guide defines how Mystery Player researchers should judge and record sources for historical match data.

## Assumptions

- `specs/001-game-rules.md` is the product source of truth: one historical match, both confirmed starting XIs, all 22 starters hidden, one global guess input, no substitute guessing.
- Early research may shortlist matches before every starter is fully cross-checked, but seed puzzle publication requires the stricter evidence rules below.
- Public web sources are acceptable for initial seed data if they are stable, reputable, and cited with access dates.
- Paid databases, private exports, and unsourced fan compilations must not be used as primary publication evidence.

## Source Tiers

Use the highest available source tier for each critical fact.

### Tier 1: Preferred

- Competition organizer match pages, archive pages, or tournament reports.
- Official club or national association match reports.
- Official competition videos or documents that show match details or team sheets.
- Contemporary official PDFs, programmes, or reports when legally accessible.

Tier 1 sources can independently support publication if they directly list the relevant fact.

### Tier 2: Reputable Secondary

- Established match databases with lineups and event details, such as WorldFootball.net, 11v11, Soccerway, ESPN, Sky Sports, or FBref.
- Reputable broadcasters and newspapers with match reports or lineups, such as BBC Sport, The Guardian, Sky Sports, ESPN, or Reuters.
- Specialist football history sources with editorial standards.

Tier 2 sources are acceptable for shortlist research and can support publication when paired with another reputable source.

### Tier 3: Context Only

- Wikipedia and similar community-edited summaries.
- Club anniversary articles that do not list complete lineups.
- YouTube descriptions, social posts, or highlight pages without team sheets.
- Blogs, forums, or unsourced fan pages.

Tier 3 sources can help find leads or context, but should not be the sole source for confirmed starters, aliases, or match metadata.

## Critical Facts

These facts must have direct source support before a puzzle can be published:

- Match date, competition, stage, venue, final score, and penalty result when relevant.
- Both team identities.
- Exactly 11 confirmed starters for each team.
- Player display names and accepted aliases.
- Hint facts, including "also played for" clues, nationality for club matches, club at match time for international matches, and first names.
- Any displayed shirt number, position label, formation slot, attendance, or manager if included.

Substitutes may be recorded as source context, but substitutes are not playable answers in the first version.

## Confidence Levels

Use the confidence terms from `specs/002-data-contract.md`.

- `high`: official source or two reputable sources agree on the fact.
- `medium`: one reputable secondary source supports the fact, or sources agree on the starter but differ on minor metadata such as display order.
- `low`: unresolved conflict, inferred value, or source is weak.

Published puzzles must not contain low-confidence starter identity, lineup membership, or accepted alias data.

## Conflict Handling

When sources disagree:

- Keep the selected value in the main puzzle data only after choosing the stronger source.
- Record the conflicting value, source links, and reason for choosing the selected value in notes.
- Prefer direct team sheets over narrative match reports.
- Prefer official competition data over later summaries when both are complete.
- Do not invent positions, formation slots, shirt numbers, or spellings to make the UI look complete.

If a conflict changes one of the 22 guessable starters, mark the match as `needs verification` until resolved.

## Alias Quality

Accepted aliases should be generous but controlled:

- Include full name, surname, common name, shirt name, unaccented form, and common transliterations where useful.
- Include mononyms only when the player is widely known by that name.
- Avoid aliases shared by two players in the same puzzle unless a later disambiguation rule exists.
- Record the source or rationale for non-obvious aliases.

## Hint Source Quality

Hint facts should be sourced with the same care as starter identities because weak hints make the puzzle feel unfair.

- Hint 1, "also played for", must be a sourced team, club, or national side the player also represented. It must not be either team in the match, must not duplicate hint 2, and must not repeat a team already visible elsewhere in the puzzle context.
- For club matches, hint 2 should use a sourced nationality.
- For international matches, hint 2 should use a sourced club at the time of the match. Avoid live current-club values for historical puzzles unless the puzzle is deliberately being updated and re-reviewed.
- Hint 3 should use a sourced or unambiguous first name from the accepted player identity.

## Publication Readiness

A candidate is ready for seed puzzle authoring when:

- At least one source directly lists both starting XIs.
- A second source can cross-check the starting XIs or the match is supported by an official complete team sheet.
- The match has enough recognizable players and context to make a 22-player global-guess puzzle fair.
- All three required hints can be sourced for all 22 players.
- Any caveats are documented before data entry.
