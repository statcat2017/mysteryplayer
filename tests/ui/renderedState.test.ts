import { Fragment, createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import seedPuzzle from '../../data/puzzles/2026-05-08.json';
import { buildShareText } from '../../src/app/puzzleGame';
import { GuessInput } from '../../src/components/GuessInput';
import { LineupBoard } from '../../src/components/LineupBoard';
import { PlayerSlot } from '../../src/components/PlayerSlot';
import { ScoreSummary } from '../../src/components/ScoreSummary';
import { ShareResult } from '../../src/components/ShareResult';
import {
  applyGuess,
  createInitialGameState,
  giveUp,
  useHint,
} from '../../src/domain/gameState';
import { validatePuzzle } from '../../src/domain/validatePuzzle';

function getValidatedPuzzle() {
  const validation = validatePuzzle(seedPuzzle);

  if (!validation.valid || !validation.puzzle) {
    throw new Error('Seed puzzle should validate inside rendered-state tests.');
  }

  return validation.puzzle;
}

describe('rendered UI states', () => {
  const puzzle = getValidatedPuzzle();
  const manUtd = puzzle.teams.find((team) => team.id === 'man-utd');

  if (!manUtd) {
    throw new Error('Expected Manchester United team in seed puzzle.');
  }

  it('renders hidden slots with slot context and named hint controls', () => {
    const markup = renderToStaticMarkup(
      createElement(LineupBoard, {
        onRevealNextHint: () => {},
        puzzle,
        session: createInitialGameState(puzzle),
        team: manUtd,
      }),
    );

    expect(markup).toContain('aria-label="Manchester United starting lineup, 0 of 11 solved"');
    expect(markup).toContain('aria-label="Manchester United GK #1, Hidden player, Hidden player"');
    expect(markup).toContain('aria-label="Reveal hint 1 for Manchester United GK #1"');
    expect(markup).toContain('>H1<');
    expect(markup).not.toContain('Hidden player</strong>');
  });

  it('keeps earlier revealed hints visible when additional hints are used', () => {
    const withOneHint = useHint(puzzle, createInitialGameState(puzzle), 'slot-peter-schmeichel');
    const withTwoHints = useHint(puzzle, withOneHint.state, 'slot-peter-schmeichel');
    const markup = renderToStaticMarkup(
      createElement(LineupBoard, {
        onRevealNextHint: () => {},
        puzzle,
        session: withTwoHints.state,
        team: manUtd,
      }),
    );

    expect(markup).toContain('Sporting CP');
    expect(markup).toContain('Denmark');
    expect(markup).not.toContain('>+1<');
    expect(markup).not.toContain('H1:');
    expect(markup).not.toContain('H2:');
  });

  it('renders solved cards as name-only green tiles', () => {
    const lineup = puzzle.lineups.find((entry) => entry.id === 'lineup-man-utd-01');
    const player = puzzle.players.find((entry) => entry.id === 'peter-schmeichel');
    const slot = puzzle.guessableSlots.find((entry) => entry.id === 'slot-peter-schmeichel');

    if (!lineup || !player || !slot) {
      throw new Error('Expected Peter Schmeichel slot fixtures in seed puzzle.');
    }

    const markup = renderToStaticMarkup(
      createElement(PlayerSlot, {
        disabled: false,
        hintCount: 0,
        lineup,
        onRevealNextHint: () => {},
        player,
        revealState: 'solved',
        score: 10,
        slot,
        teamName: manUtd.name,
      }),
    );

    expect(markup).toContain('Peter Schmeichel');
    expect(markup).toContain('player-slot__solved-name');
    expect(markup).not.toContain('Nationality:');
    expect(markup).not.toContain('player-slot__meta');
    expect(markup).not.toContain('hint-panel');
  });

  it('renders disabled terminal-state controls and revealed zero-point slots after give up', () => {
    const solvedOnce = applyGuess(puzzle, createInitialGameState(puzzle), 'Dwight Yorke');
    const gaveUpState = giveUp(puzzle, solvedOnce.state).state;
    const markup = renderToStaticMarkup(
      createElement(
        Fragment,
        null,
        createElement(GuessInput, {
          disabled: true,
          disabledReason: 'Guessing is locked because the lineup was revealed after giving up.',
          helperText:
            'Guess a player from either starting XI. Correct answers reveal names anywhere on the board.',
          onSubmitGuess: () => {},
        }),
        createElement(ScoreSummary, {
          onGiveUp: () => {},
          onReset: () => {},
          puzzle,
          session: gaveUpState,
        }),
        createElement(LineupBoard, {
          onRevealNextHint: () => {},
          puzzle,
          session: gaveUpState,
          team: manUtd,
        }),
      ),
    );

    expect(markup).toContain('id="player-guess-disabled"');
    expect(markup).toContain('aria-describedby="player-guess-helper player-guess-disabled"');
    expect(markup).toContain('disabled=""');
    expect(markup).toContain('aria-label="5 lives remaining"');
    expect(markup).toContain('Give up</button>');
    expect(markup).toContain('Peter Schmeichel');
    expect(markup).toContain('Revealed after give up for 0 points');
    expect(markup).not.toContain('Use hint 1');
  });

  it('renders the post-game share card around spoiler-safe summary text', () => {
    const withHint = useHint(puzzle, createInitialGameState(puzzle), 'slot-peter-schmeichel');
    const solved = applyGuess(puzzle, withHint.state, 'Peter Schmeichel');
    const terminalState = giveUp(puzzle, solved.state).state;
    const summary = buildShareText(puzzle, terminalState);
    const markup = renderToStaticMarkup(createElement(ShareResult, { summary }));

    expect(summary).toContain('Result: Gave up');
    expect(summary).toContain('Hints: 1');
    expect(summary).not.toContain('Manchester United');
    expect(summary).not.toContain('Peter Schmeichel');
    expect(markup).toContain('Post-game share');
    expect(markup).toContain('Spoiler-safe result');
    expect(markup).toContain('Copy the spoiler-safe share block.');
    expect(markup).toContain('aria-label="Spoiler-safe share result"');
    expect(markup).toContain('Result: Gave up');
  });
});
