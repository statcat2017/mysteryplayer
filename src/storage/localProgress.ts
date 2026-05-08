import {
  createInitialGameState,
  restoreGameState,
  type GameState,
} from '../domain/gameState';
import type { PuzzleRecord } from '../domain/puzzleTypes';

const STORAGE_PREFIX = 'mystery-player:progress:';
const STORAGE_VERSION = 1;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

interface PersistedGameProgress {
  version: number;
  state: GameState;
}

export function getLocalProgressKey(
  puzzle: Pick<PuzzleRecord, 'puzzleId' | 'publishDate'>,
): string {
  return `${STORAGE_PREFIX}${puzzle.puzzleId || puzzle.publishDate}`;
}

export function saveLocalProgress(
  storage: StorageLike,
  puzzle: Pick<PuzzleRecord, 'puzzleId' | 'publishDate'>,
  state: GameState,
): void {
  const payload: PersistedGameProgress = {
    version: STORAGE_VERSION,
    state,
  };

  storage.setItem(getLocalProgressKey(puzzle), JSON.stringify(payload));
}

export function loadLocalProgress(
  storage: StorageLike,
  puzzle: PuzzleRecord,
): GameState | null {
  const key = getLocalProgressKey(puzzle);
  const rawValue = storage.getItem(key);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<PersistedGameProgress>;

    if (parsed.version !== STORAGE_VERSION) {
      storage.removeItem(key);
      return null;
    }

    const restored = restoreGameState(puzzle, parsed.state);

    if (!restored) {
      storage.removeItem(key);
      return null;
    }

    return restored;
  } catch {
    storage.removeItem(key);
    return null;
  }
}

export function loadOrCreateLocalProgress(
  storage: StorageLike,
  puzzle: PuzzleRecord,
): GameState {
  return loadLocalProgress(storage, puzzle) ?? createInitialGameState(puzzle);
}

export function clearLocalProgress(
  storage: StorageLike,
  puzzle: Pick<PuzzleRecord, 'puzzleId' | 'publishDate'>,
): void {
  storage.removeItem(getLocalProgressKey(puzzle));
}
