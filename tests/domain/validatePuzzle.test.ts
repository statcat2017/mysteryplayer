import { describe, expect, it } from 'vitest';
import seedPuzzle from '../../data/puzzles/2026-05-08.json';
import { validatePuzzle } from '../../src/domain/validatePuzzle';

describe('validatePuzzle', () => {
  it('accepts the current seed puzzle with no blocking errors', () => {
    const result = validatePuzzle(seedPuzzle);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.puzzle?.guessableSlots).toHaveLength(22);
  });

  it('rejects puzzles that break lineup and guessable slot counts', () => {
    const invalidPuzzle = structuredClone(seedPuzzle);
    invalidPuzzle.lineups.pop();

    const result = validatePuzzle(invalidPuzzle);

    expect(result.valid).toBe(false);
    expect(result.errors.some((issue) => issue.message.includes('exactly 22 lineup entries'))).toBe(true);
    expect(result.errors.some((issue) => issue.message.includes('Unknown lineup entry'))).toBe(true);
  });

  it('rejects cross-player alias collisions after normalization', () => {
    const invalidPuzzle = structuredClone(seedPuzzle);
    invalidPuzzle.players[0].answerAliases.push({
      value: 'Mbappé',
      type: 'other',
    });

    const result = validatePuzzle(invalidPuzzle);

    expect(result.valid).toBe(false);
    expect(result.errors.some((issue) => issue.message.includes('collides with player'))).toBe(true);
  });
});
