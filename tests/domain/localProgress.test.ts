import { describe, expect, it } from 'vitest';
import {
  applyGuess,
  createInitialGameState,
  useHint,
} from '../../src/domain/gameState';
import {
  clearLocalProgress,
  getLocalProgressKey,
  loadLocalProgress,
  loadOrCreateLocalProgress,
  saveLocalProgress,
  type StorageLike,
} from '../../src/storage/localProgress';
import { getTestPuzzle } from './testPuzzle';

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

describe('localProgress', () => {
  const puzzle = getTestPuzzle();
  const hintedSlotId = 'slot-peter-schmeichel';
  const solvedSlotId = 'slot-dwight-yorke';

  it('round-trips saved puzzle progress by puzzle key', () => {
    const storage = new MemoryStorage();
    let state = createInitialGameState(puzzle);

    state = useHint(puzzle, state, hintedSlotId).state;
    state = applyGuess(puzzle, state, 'Schmeichel').state;
    state = applyGuess(puzzle, state, 'Pele').state;

    saveLocalProgress(storage, puzzle, state);

    const restored = loadLocalProgress(storage, puzzle);

    expect(restored).toEqual(state);
    expect(getLocalProgressKey(puzzle)).toBe('mystery-player:progress:2026-05-08');
  });

  it('drops incompatible cached progress and falls back to a fresh state', () => {
    const storage = new MemoryStorage();
    const key = getLocalProgressKey(puzzle);
    const state = createInitialGameState(puzzle);

    storage.setItem(
      key,
      JSON.stringify({
        version: 1,
        state: {
          ...state,
          puzzleId: 'other-puzzle',
        },
      }),
    );

    expect(loadLocalProgress(storage, puzzle)).toBeNull();
    expect(storage.getItem(key)).toBeNull();

    const fallback = loadOrCreateLocalProgress(storage, puzzle);

    expect(fallback).toEqual(createInitialGameState(puzzle));
  });

  it('normalizes restored state boundaries instead of trusting cached terminal flags', () => {
    const storage = new MemoryStorage();
    const key = getLocalProgressKey(puzzle);

    storage.setItem(
      key,
      JSON.stringify({
        version: 1,
        state: {
          ...createInitialGameState(puzzle),
          solvedSlotIds: [solvedSlotId],
          revealedSlotIds: [solvedSlotId, hintedSlotId],
          normalizedIncorrectGuesses: ['pele'],
          attempts: 0,
          hintsUsedBySlotId: {
            [solvedSlotId]: 1,
            'slot-missing': 3,
          },
          status: 'gameOver',
        },
      }),
    );

    const restored = loadLocalProgress(storage, puzzle);

    expect(restored?.status).toBe('inProgress');
    expect(restored?.revealedSlotIds).toEqual([solvedSlotId]);
    expect(restored?.solvedSlotIds).toEqual([solvedSlotId]);
    expect(restored?.attempts).toBe(1);
    expect(restored?.livesRemaining).toBe(4);
    expect(restored?.hintsUsedBySlotId).toEqual({
      [solvedSlotId]: 1,
    });
  });

  it('clears saved progress for a puzzle', () => {
    const storage = new MemoryStorage();
    const state = createInitialGameState(puzzle);

    saveLocalProgress(storage, puzzle, state);
    clearLocalProgress(storage, puzzle);

    expect(storage.getItem(getLocalProgressKey(puzzle))).toBeNull();
  });
});
