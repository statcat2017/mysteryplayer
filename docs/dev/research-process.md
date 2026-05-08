# Research Process

This process is for turning historical football matches into reliable Mystery Player puzzle candidates and seed data.

## Current Game Constraints

The current rules in `specs/001-game-rules.md` define the first playable format:

- One historically meaningful match per puzzle.
- Both teams' confirmed starting XIs are included.
- All 22 starters are hidden at launch.
- One global text input accepts guesses for any hidden player.
- No specific position selection is required.
- Substitutes are not playable answers.

Research should therefore optimize for complete, source-backed starting XIs and fair global name guessing, not for missing-position reconstruction.

Researchers should also classify each puzzle as a club match or an international match because hint 2 depends on match type.

## Candidate Research Steps

1. Identify a historically meaningful match.
2. Find at least one source that lists the full match details and both starting XIs.
3. Find a second source for cross-checking, ideally from a different publisher or the official organizer.
4. Record date, teams, competition, stage, venue, score, attendance when reliable, and why the match matters.
5. Assess all 22 starters for recognizability, alias risk, and hint availability.
6. Flag conflicts, weak sources, disputed spellings, and position uncertainty.
7. Assign a likely difficulty and puzzle suitability note.
8. Promote the strongest candidates to seed puzzle creation.

## Source Recording

For each source, record:

- Title.
- URL.
- Publisher.
- Accessed date.
- Source type.
- What facts it supports.
- Confidence and caveats.

Use `docs/dev/source-quality.md` for tiering and confidence. Use `specs/002-data-contract.md` for eventual source object shape.

## Candidate Difficulty

Difficulty is an author judgment for the 22-player global-guess format:

- `easy`: many internationally famous starters across both teams; modern match; strong contextual memory.
- `medium`: several famous names plus some role players; hints likely make the rest fair.
- `hard`: older match, less globally familiar teams, many domestic specialists, or high alias/transliteration burden.

Difficulty should consider the whole 22-player set, not only the famous goalscorers.

## Suitability Checks

A good first seed puzzle should have:

- Strong historical hook.
- Complete source-backed starting XIs.
- Familiarity spread across both teams.
- Low risk of duplicate answer aliases.
- Useful hints for less famous starters.
- Display context that helps without requiring position-specific guessing.

Avoid first-wave puzzles where:

- One team has too many obscure players for a broad audience.
- Lineup sources disagree on starters.
- Player names have heavy transliteration ambiguity that cannot be handled with aliases.
- The match is famous but the 22 starters are not fair to guess.

## Handling Positions

Positions, shirt numbers, and formations are optional display metadata. They are not required for answer matching.

Research may record them when source-backed, but should use broader labels if precise formation slots differ between sources. Never block a good candidate solely because exact formation positions are unclear.

## Hints

Each guessable player needs three usable hints before publication. Hint types follow MP-001:

1. Also played for...
2. Nationality for club matches, or club at match time for international matches.
3. First name...

Hint 1 must name another team, club, or national side the player represented. It must not be either team in the match, must not repeat a team already visible elsewhere in the puzzle context, and should not duplicate hint 2. The players Wikipedia page will be the primary, and easiest, source for this. Make sure to avoid the current club.

For international matches, hint 2 should be sourced as the player's club at the time of the match. Do not use an unsourced live current-club value for historical puzzles, because it can drift after publication.

Hints must be sourced where possible. They should help without revealing the full answer. For internationally obvious players, hints still need to exist for consistency and scoring.

## Handoff To Seed Data

When handing a match to MP-005, include:

- Selected match and rationale.
- Source list with confidence.
- Confirmed 22 starters.
- Known aliases and accent/transliteration notes.
- Candidate hints or hint research leads, including match-type-specific hint 2 values.
- Any unresolved caveats that QA must review.
