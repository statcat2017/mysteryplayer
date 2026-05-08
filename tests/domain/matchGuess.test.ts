import { describe, expect, it } from 'vitest';
import seedPuzzle from '../../data/puzzles/2026-05-08.json';
import { matchGuess } from '../../src/domain/matchGuess';
import { validatePuzzle } from '../../src/domain/validatePuzzle';

describe('matchGuess', () => {
  const validation = validatePuzzle(seedPuzzle);

  if (!validation.valid || !validation.puzzle) {
    throw new Error('Seed puzzle should validate inside matchGuess tests.');
  }

  const puzzle = validation.puzzle;

  it('matches recorded aliases globally across all unrevealed starters', () => {
    const result = matchGuess(puzzle, 'Leo Messi');

    expect(result.matchingSlotIds).toEqual(['slot-argentina-10']);
    expect(result.matchedPlayerIds).toEqual(['lionel-messi']);
  });

  it('does not return slots that have already been revealed', () => {
    const result = matchGuess(puzzle, 'Messi', ['slot-argentina-10']);

    expect(result.matchingSlotIds).toEqual([]);
    expect(result.alreadyRevealed).toBe(true);
  });
});
