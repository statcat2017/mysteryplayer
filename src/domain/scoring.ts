import type { GameState } from './gameState';
import type { GuessableSlot, PuzzleRecord } from './puzzleTypes';

export const DEFAULT_SLOT_POINTS = 10;
export const DEFAULT_HINT_PENALTY = 2;
export const MINIMUM_SOLVED_SLOT_POINTS = 2;

function clampHintCount(slot: GuessableSlot, hintsUsedCount: number): number {
  return Math.max(0, Math.min(hintsUsedCount, slot.hints.length));
}

export function calculateSlotScore(
  slot: GuessableSlot,
  hintsUsedCount: number,
): number {
  const appliedHints = clampHintCount(slot, hintsUsedCount);
  const penalty = slot.hints
    .slice(0, appliedHints)
    .reduce((total, hint) => total + (hint.penaltyPoints ?? DEFAULT_HINT_PENALTY), 0);

  return Math.max(MINIMUM_SOLVED_SLOT_POINTS, DEFAULT_SLOT_POINTS - penalty);
}

export function calculateCurrentScore(
  puzzle: PuzzleRecord,
  state: Pick<GameState, 'solvedSlotIds' | 'hintsUsedBySlotId'>,
): number {
  const slotsById = new Map(puzzle.guessableSlots.map((slot) => [slot.id, slot]));

  return state.solvedSlotIds.reduce((total, slotId) => {
    const slot = slotsById.get(slotId);

    if (!slot) {
      return total;
    }

    const hintsUsed = state.hintsUsedBySlotId[slotId] ?? 0;
    return total + calculateSlotScore(slot, hintsUsed);
  }, 0);
}

export function calculateMaximumScore(puzzle: PuzzleRecord): number {
  return puzzle.guessableSlots.length * DEFAULT_SLOT_POINTS;
}
