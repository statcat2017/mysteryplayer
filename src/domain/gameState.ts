import { matchGuess } from './matchGuess';
import type { Hint, PuzzleRecord } from './puzzleTypes';
import { calculateCurrentScore } from './scoring';

export const INITIAL_LIVES = 5;

export type GameStatus = 'inProgress' | 'completed' | 'gaveUp' | 'gameOver';
export type GuessOutcome =
  | 'blocked'
  | 'empty'
  | 'correct'
  | 'alreadySolved'
  | 'incorrect'
  | 'duplicateIncorrect';
export type HintOutcome =
  | 'blocked'
  | 'invalidSlot'
  | 'alreadySolved'
  | 'alreadyUsedAll'
  | 'revealed';
export type GiveUpOutcome = 'blocked' | 'gaveUp';

export interface GameState {
  puzzleId: string;
  publishDate: string;
  revealedSlotIds: string[];
  solvedSlotIds: string[];
  normalizedIncorrectGuesses: string[];
  attempts: number;
  livesRemaining: number;
  hintsUsedBySlotId: Record<string, number>;
  status: GameStatus;
  completed: boolean;
  gaveUp: boolean;
  gameOver: boolean;
  finalScore: number | null;
}

export interface ApplyGuessResult {
  outcome: GuessOutcome;
  normalizedGuess: string;
  matchedSlotIds: string[];
  state: GameState;
}

export interface UseHintResult {
  outcome: HintOutcome;
  slotId: string;
  revealedHintCount: number;
  hint: Hint | null;
  state: GameState;
}

export interface GiveUpResult {
  outcome: GiveUpOutcome;
  state: GameState;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function uniqueSlotIds(puzzle: PuzzleRecord, values: Iterable<string>): string[] {
  const allowed = new Set(puzzle.guessableSlots.map((slot) => slot.id));
  const unique = new Set<string>();

  for (const value of values) {
    if (allowed.has(value)) {
      unique.add(value);
    }
  }

  return puzzle.guessableSlots
    .map((slot) => slot.id)
    .filter((slotId) => unique.has(slotId));
}

function allSlotIds(puzzle: PuzzleRecord): string[] {
  return puzzle.guessableSlots.map((slot) => slot.id);
}

function toTerminalState(
  puzzle: PuzzleRecord,
  state: GameState,
  status: Extract<GameStatus, 'completed' | 'gaveUp' | 'gameOver'>,
): GameState {
  const terminalState: GameState = {
    ...state,
    revealedSlotIds: allSlotIds(puzzle),
    status,
    completed: status === 'completed',
    gaveUp: status === 'gaveUp',
    gameOver: status === 'gameOver',
  };

  return {
    ...terminalState,
    finalScore: calculateCurrentScore(puzzle, terminalState),
  };
}

function toInProgressState(state: GameState): GameState {
  return {
    ...state,
    status: 'inProgress',
    completed: false,
    gaveUp: false,
    gameOver: false,
    finalScore: null,
  };
}

function isTerminal(state: Pick<GameState, 'status'>): boolean {
  return state.status !== 'inProgress';
}

function normalizeHintState(
  puzzle: PuzzleRecord,
  rawValue: unknown,
): Record<string, number> {
  if (!isRecord(rawValue)) {
    return {};
  }

  const slotMap = new Map(puzzle.guessableSlots.map((slot) => [slot.id, slot]));
  const normalized: Record<string, number> = {};

  for (const [slotId, value] of Object.entries(rawValue)) {
    const slot = slotMap.get(slotId);

    if (!slot || !Number.isInteger(value)) {
      continue;
    }

    normalized[slotId] = Math.max(0, Math.min(Number(value), slot.hints.length));
  }

  return normalized;
}

function normalizeIncorrectGuesses(rawValue: unknown): string[] {
  if (!Array.isArray(rawValue)) {
    return [];
  }

  const unique = new Set<string>();

  rawValue.forEach((value) => {
    if (typeof value === 'string' && value.trim().length > 0) {
      unique.add(value.trim());
    }
  });

  return [...unique];
}

function readStatus(rawValue: unknown): GameStatus {
  return rawValue === 'completed' ||
    rawValue === 'gaveUp' ||
    rawValue === 'gameOver'
    ? rawValue
    : 'inProgress';
}

export function createInitialGameState(puzzle: Pick<PuzzleRecord, 'puzzleId' | 'publishDate'>): GameState {
  return {
    puzzleId: puzzle.puzzleId,
    publishDate: puzzle.publishDate,
    revealedSlotIds: [],
    solvedSlotIds: [],
    normalizedIncorrectGuesses: [],
    attempts: 0,
    livesRemaining: INITIAL_LIVES,
    hintsUsedBySlotId: {},
    status: 'inProgress',
    completed: false,
    gaveUp: false,
    gameOver: false,
    finalScore: null,
  };
}

export function restoreGameState(
  puzzle: PuzzleRecord,
  snapshot: unknown,
): GameState | null {
  if (!isRecord(snapshot)) {
    return null;
  }

  if (
    snapshot.puzzleId !== puzzle.puzzleId ||
    snapshot.publishDate !== puzzle.publishDate
  ) {
    return null;
  }

  const solvedSlotIds = uniqueSlotIds(
    puzzle,
    Array.isArray(snapshot.solvedSlotIds) ? snapshot.solvedSlotIds : [],
  );
  const normalizedIncorrectGuesses = normalizeIncorrectGuesses(
    snapshot.normalizedIncorrectGuesses,
  );
  const hintsUsedBySlotId = normalizeHintState(puzzle, snapshot.hintsUsedBySlotId);
  const attempts =
    Number.isInteger(snapshot.attempts) && Number(snapshot.attempts) >= 0
      ? Math.max(Number(snapshot.attempts), normalizedIncorrectGuesses.length)
      : normalizedIncorrectGuesses.length;
  const livesRemaining = Math.max(
    0,
    INITIAL_LIVES - normalizedIncorrectGuesses.length,
  );
  const requestedStatus = readStatus(snapshot.status);

  const baseState: GameState = {
    puzzleId: puzzle.puzzleId,
    publishDate: puzzle.publishDate,
    revealedSlotIds: solvedSlotIds,
    solvedSlotIds,
    normalizedIncorrectGuesses,
    attempts,
    livesRemaining,
    hintsUsedBySlotId,
    status: 'inProgress',
    completed: false,
    gaveUp: false,
    gameOver: false,
    finalScore: null,
  };

  if (requestedStatus === 'gaveUp') {
    return toTerminalState(puzzle, baseState, 'gaveUp');
  }

  if (livesRemaining === 0) {
    return toTerminalState(puzzle, baseState, 'gameOver');
  }

  if (solvedSlotIds.length === puzzle.guessableSlots.length) {
    return toTerminalState(puzzle, baseState, 'completed');
  }

  return toInProgressState(baseState);
}

export function getSolvedCount(state: Pick<GameState, 'solvedSlotIds'>): number {
  return state.solvedSlotIds.length;
}

export function getHintsUsedCount(
  state: Pick<GameState, 'hintsUsedBySlotId'>,
  slotId: string,
): number {
  return state.hintsUsedBySlotId[slotId] ?? 0;
}

export function getTotalHintsUsed(
  state: Pick<GameState, 'hintsUsedBySlotId'>,
): number {
  return Object.values(state.hintsUsedBySlotId).reduce(
    (total, count) => total + count,
    0,
  );
}

export function isSlotRevealed(
  state: Pick<GameState, 'revealedSlotIds'>,
  slotId: string,
): boolean {
  return state.revealedSlotIds.includes(slotId);
}

export function applyGuess(
  puzzle: PuzzleRecord,
  currentState: GameState,
  guess: string,
): ApplyGuessResult {
  if (isTerminal(currentState)) {
    return {
      outcome: 'blocked',
      normalizedGuess: '',
      matchedSlotIds: [],
      state: currentState,
    };
  }

  const match = matchGuess(puzzle, guess, currentState.revealedSlotIds);

  if (!match.normalizedGuess) {
    return {
      outcome: 'empty',
      normalizedGuess: match.normalizedGuess,
      matchedSlotIds: [],
      state: currentState,
    };
  }

  if (match.matchingSlotIds.length > 0) {
    const revealedSlotIds = uniqueSlotIds(puzzle, [
      ...currentState.revealedSlotIds,
      ...match.matchingSlotIds,
    ]);
    const solvedSlotIds = uniqueSlotIds(puzzle, [
      ...currentState.solvedSlotIds,
      ...match.matchingSlotIds,
    ]);
    const nextState: GameState = {
      ...currentState,
      revealedSlotIds,
      solvedSlotIds,
      attempts: currentState.attempts + 1,
    };

    return {
      outcome: 'correct',
      normalizedGuess: match.normalizedGuess,
      matchedSlotIds: match.matchingSlotIds,
      state:
        solvedSlotIds.length === puzzle.guessableSlots.length
          ? toTerminalState(puzzle, nextState, 'completed')
          : nextState,
    };
  }

  if (match.alreadyRevealed) {
    return {
      outcome: 'alreadySolved',
      normalizedGuess: match.normalizedGuess,
      matchedSlotIds: [],
      state: currentState,
    };
  }

  if (currentState.normalizedIncorrectGuesses.includes(match.normalizedGuess)) {
    return {
      outcome: 'duplicateIncorrect',
      normalizedGuess: match.normalizedGuess,
      matchedSlotIds: [],
      state: currentState,
    };
  }

  const nextState: GameState = {
    ...currentState,
    normalizedIncorrectGuesses: [
      ...currentState.normalizedIncorrectGuesses,
      match.normalizedGuess,
    ],
    attempts: currentState.attempts + 1,
    livesRemaining: currentState.livesRemaining - 1,
  };

  return {
    outcome: 'incorrect',
    normalizedGuess: match.normalizedGuess,
    matchedSlotIds: [],
    state:
      nextState.livesRemaining === 0
        ? toTerminalState(puzzle, nextState, 'gameOver')
        : nextState,
  };
}

export function useHint(
  puzzle: PuzzleRecord,
  currentState: GameState,
  slotId: string,
): UseHintResult {
  if (isTerminal(currentState)) {
    return {
      outcome: 'blocked',
      slotId,
      revealedHintCount: getHintsUsedCount(currentState, slotId),
      hint: null,
      state: currentState,
    };
  }

  const slot = puzzle.guessableSlots.find((candidate) => candidate.id === slotId);

  if (!slot) {
    return {
      outcome: 'invalidSlot',
      slotId,
      revealedHintCount: 0,
      hint: null,
      state: currentState,
    };
  }

  if (currentState.solvedSlotIds.includes(slotId)) {
    return {
      outcome: 'alreadySolved',
      slotId,
      revealedHintCount: getHintsUsedCount(currentState, slotId),
      hint: null,
      state: currentState,
    };
  }

  const currentHintCount = getHintsUsedCount(currentState, slotId);

  if (currentHintCount >= slot.hints.length) {
    return {
      outcome: 'alreadyUsedAll',
      slotId,
      revealedHintCount: currentHintCount,
      hint: null,
      state: currentState,
    };
  }

  const revealedHintCount = currentHintCount + 1;
  const nextState: GameState = {
    ...currentState,
    hintsUsedBySlotId: {
      ...currentState.hintsUsedBySlotId,
      [slotId]: revealedHintCount,
    },
  };

  return {
    outcome: 'revealed',
    slotId,
    revealedHintCount,
    hint: slot.hints[currentHintCount] ?? null,
    state: nextState,
  };
}

export function giveUp(
  puzzle: PuzzleRecord,
  currentState: GameState,
): GiveUpResult {
  if (isTerminal(currentState)) {
    return {
      outcome: 'blocked',
      state: currentState,
    };
  }

  return {
    outcome: 'gaveUp',
    state: toTerminalState(puzzle, currentState, 'gaveUp'),
  };
}
