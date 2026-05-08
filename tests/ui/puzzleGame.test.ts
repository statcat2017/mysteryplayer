import { describe, expect, it } from 'vitest';
import seedPuzzle from '../../data/puzzles/2026-05-08.json';
import {
  buildShareText,
  formatGiveUpAnnouncement,
  formatGuessAnnouncement,
  formatHintAnnouncement,
  getCurrentScore,
} from '../../src/app/puzzleGame';
import {
  applyGuess,
  createInitialGameState,
  giveUp,
  useHint,
} from '../../src/domain/gameState';
import { validatePuzzle } from '../../src/domain/validatePuzzle';

describe('puzzleGame UI helpers', () => {
  const validation = validatePuzzle(seedPuzzle);

  if (!validation.valid || !validation.puzzle) {
    throw new Error('Seed puzzle should validate inside puzzleGame tests.');
  }

  const puzzle = validation.puzzle;

  it('formats duplicate wrong guesses as non-penalized feedback', () => {
    const initialState = createInitialGameState(puzzle);
    const firstMiss = applyGuess(puzzle, initialState, 'Made Up Name');
    const duplicateMiss = applyGuess(puzzle, firstMiss.state, 'Made-Up Name');

    expect(formatGuessAnnouncement(puzzle, duplicateMiss)).toContain(
      'Duplicate misses do not cost a life',
    );
    expect(duplicateMiss.state.livesRemaining).toBe(4);
  });

  it('reflects hint penalties in current score and hint feedback', () => {
    const firstHint = useHint(puzzle, createInitialGameState(puzzle), 'slot-argentina-10');
    const solved = applyGuess(puzzle, firstHint.state, 'Lionel Messi');

    expect(formatHintAnnouncement(firstHint)).toContain('Hint 1 unlocked');
    expect(getCurrentScore(puzzle, solved.state)).toBe(8);
  });

  it('announces completion when the last player is solved', () => {
    const almostComplete = {
      ...createInitialGameState(puzzle),
      attempts: 21,
      revealedSlotIds: puzzle.guessableSlots.slice(1).map((slot) => slot.id),
      solvedSlotIds: puzzle.guessableSlots.slice(1).map((slot) => slot.id),
    };
    const result = applyGuess(puzzle, almostComplete, 'Emiliano Martinez');

    expect(result.state.status).toBe('completed');
    expect(formatGuessAnnouncement(puzzle, result)).toContain('completes the lineup');
  });

  it('builds spoiler-safe summary text from a terminal state', () => {
    const solvedOnce = applyGuess(puzzle, createInitialGameState(puzzle), 'Lionel Messi');
    const gaveUpResult = giveUp(puzzle, solvedOnce.state);
    const shareText = buildShareText(puzzle, gaveUpResult.state);

    expect(formatGiveUpAnnouncement(puzzle, gaveUpResult)).toContain('You gave up');
    expect(shareText).toContain('Result: Gave up');
    expect(shareText).not.toContain('Argentina');
    expect(shareText).not.toContain('France');
    expect(shareText).not.toContain('Lionel Messi');
  });
});
