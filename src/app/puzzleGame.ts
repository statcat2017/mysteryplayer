import {
  ApplyGuessResult,
  GameState,
  GameStatus,
  GiveUpResult,
  getHintsUsedCount,
  getSolvedCount,
  getTotalHintsUsed,
  UseHintResult,
} from '../domain/gameState';
import { calculateCurrentScore, calculateMaximumScore, calculateSlotScore } from '../domain/scoring';
import { PuzzleRecord } from '../domain/puzzleTypes';

export type SlotRevealState = 'hidden' | 'solved' | 'revealed-after-end';

export function getStatusLabel(status: GameStatus): string {
  switch (status) {
    case 'completed':
      return 'Solved';
    case 'gaveUp':
      return 'Gave up';
    case 'gameOver':
      return 'Out of lives';
    default:
      return 'In progress';
  }
}

export function getSlotRevealState(state: GameState, slotId: string): SlotRevealState {
  if (state.solvedSlotIds.includes(slotId)) {
    return 'solved';
  }

  if (state.revealedSlotIds.includes(slotId)) {
    return 'revealed-after-end';
  }

  return 'hidden';
}

export function getSlotScore(
  puzzle: PuzzleRecord,
  state: GameState,
  slotId: string,
): number {
  if (!state.solvedSlotIds.includes(slotId)) {
    return 0;
  }

  const slot = puzzle.guessableSlots.find((candidate) => candidate.id === slotId);

  if (!slot) {
    return 0;
  }

  return calculateSlotScore(slot, getHintsUsedCount(state, slotId));
}

export function getCurrentScore(puzzle: PuzzleRecord, state: GameState): number {
  return state.finalScore ?? calculateCurrentScore(puzzle, state);
}

export function buildShareText(puzzle: PuzzleRecord, state: GameState): string {
  const title = puzzle.puzzleNumber
    ? `Mystery Player #${puzzle.puzzleNumber}`
    : `Mystery Player ${puzzle.publishDate}`;

  return [
    title,
    `Result: ${getStatusLabel(state.status)}`,
    `Score: ${getCurrentScore(puzzle, state)}/${calculateMaximumScore(puzzle)}`,
    `Solved: ${getSolvedCount(state)}/${puzzle.guessableSlots.length}`,
    `Attempts: ${state.attempts} | Lives: ${state.livesRemaining} | Hints: ${getTotalHintsUsed(state)}`,
    buildShareGrid(puzzle, state),
  ].join('\n');
}

export function formatGuessAnnouncement(
  puzzle: PuzzleRecord,
  result: ApplyGuessResult,
): string {
  switch (result.outcome) {
    case 'blocked':
      return 'This puzzle is finished. Start a new day to keep guessing.';
    case 'empty':
      return 'Enter a player name to make a guess.';
    case 'alreadySolved':
      return 'That player is already on the board. Try a different name.';
    case 'duplicateIncorrect':
      return 'You already tried that wrong answer. Duplicate misses do not cost a life.';
    case 'incorrect':
      return result.state.status === 'gameOver'
        ? 'No match. You are out of lives.'
        : `No match. ${result.state.livesRemaining} lives remaining.`;
    case 'correct':
      return result.state.status === 'completed'
        ? `Correct. ${formatMatchedNames(puzzle, result.matchedSlotIds)} completes the lineup.`
        : `Correct. ${formatMatchedNames(puzzle, result.matchedSlotIds)} revealed.`;
    default:
      return 'Update received.';
  }
}

export function formatHintAnnouncement(result: UseHintResult): string {
  switch (result.outcome) {
    case 'blocked':
      return 'Hints are locked because this puzzle is finished.';
    case 'invalidSlot':
      return 'That hint could not be found.';
    case 'alreadySolved':
      return 'That player is already solved. No more hints needed.';
    case 'alreadyUsedAll':
      return 'All hints for this player are already visible.';
    case 'revealed':
      return result.hint
        ? `Hint ${result.hint.order} unlocked: ${result.hint.text}`
        : 'A hint was revealed.';
    default:
      return 'Hint updated.';
  }
}

export function formatGiveUpAnnouncement(
  puzzle: PuzzleRecord,
  result: GiveUpResult,
): string {
  if (result.outcome === 'blocked') {
    return 'This puzzle is already finished.';
  }

  return `You gave up with ${getSolvedCount(result.state)} of ${puzzle.guessableSlots.length} players solved.`;
}

function formatMatchedNames(puzzle: PuzzleRecord, slotIds: string[]): string {
  const slotsById = new Map(puzzle.guessableSlots.map((slot) => [slot.id, slot]));
  const playersById = new Map(puzzle.players.map((player) => [player.id, player]));
  const names = slotIds
    .map((slotId) => slotsById.get(slotId))
    .map((slot) => (slot ? playersById.get(slot.playerId)?.displayName : undefined))
    .filter((name): name is string => Boolean(name));

  if (names.length === 0) {
    return 'Starter';
  }

  if (names.length === 1) {
    return names[0];
  }

  return `${names.length} players`;
}

function buildShareGrid(puzzle: PuzzleRecord, state: GameState): string {
  const order = { O: 0, H: 1, X: 2 };
  const symbols = puzzle.guessableSlots
    .map((slot) => {
      if (!state.solvedSlotIds.includes(slot.id)) {
        return 'X';
      }

      return getHintsUsedCount(state, slot.id) > 0 ? 'H' : 'O';
    })
    .sort((left, right) => order[left] - order[right]);

  const rows: string[] = [];

  for (let index = 0; index < symbols.length; index += 11) {
    rows.push(symbols.slice(index, index + 11).join(''));
  }

  return rows.join('\n');
}
