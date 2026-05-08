import { describe, expect, it } from 'vitest';
import {
  applyGuess,
  createInitialGameState,
  getHintsUsedCount,
  getSolvedCount,
  getTotalHintsUsed,
  giveUp,
  isSlotRevealed,
  useHint,
} from '../../src/domain/gameState';
import { getTestPuzzle } from './testPuzzle';

function solveAllSlotsExcept(
  excludedSlotIds: string[],
  state = createInitialGameState(getTestPuzzle()),
) {
  const puzzle = getTestPuzzle();
  const playersById = new Map(puzzle.players.map((player) => [player.id, player]));
  let nextState = state;

  for (const slot of puzzle.guessableSlots) {
    if (excludedSlotIds.includes(slot.id)) {
      continue;
    }

    const player = playersById.get(slot.playerId);

    if (!player) {
      throw new Error(`Missing player ${slot.playerId} in test puzzle.`);
    }

    nextState = applyGuess(puzzle, nextState, player.displayName).state;
  }

  return nextState;
}

describe('gameState', () => {
  const puzzle = getTestPuzzle();
  const hintedSlotId = 'slot-peter-schmeichel';
  const hintedGuess = 'Schmeichel';
  const cleanSolvedSlotId = 'slot-dwight-yorke';
  const cleanSolvedGuess = 'Dwight Yorke';

  it('creates an initial in-progress state', () => {
    const state = createInitialGameState(puzzle);

    expect(state.status).toBe('inProgress');
    expect(state.livesRemaining).toBe(5);
    expect(state.attempts).toBe(0);
    expect(state.revealedSlotIds).toEqual([]);
    expect(state.solvedSlotIds).toEqual([]);
    expect(state.finalScore).toBeNull();
  });

  it('reveals correct guesses and ignores repeat correct guesses', () => {
    const initialState = createInitialGameState(puzzle);
    const firstGuess = applyGuess(puzzle, initialState, hintedGuess);

    expect(firstGuess.outcome).toBe('correct');
    expect(firstGuess.state.attempts).toBe(1);
    expect(firstGuess.state.livesRemaining).toBe(5);
    expect(firstGuess.matchedSlotIds).toEqual([hintedSlotId]);
    expect(isSlotRevealed(firstGuess.state, hintedSlotId)).toBe(true);
    expect(getSolvedCount(firstGuess.state)).toBe(1);

    const repeatGuess = applyGuess(puzzle, firstGuess.state, hintedGuess);

    expect(repeatGuess.outcome).toBe('alreadySolved');
    expect(repeatGuess.state.attempts).toBe(1);
    expect(repeatGuess.state.livesRemaining).toBe(5);
    expect(getSolvedCount(repeatGuess.state)).toBe(1);
  });

  it('counts only unique incorrect guesses against attempts and lives', () => {
    const initialState = createInitialGameState(puzzle);
    const wrongGuess = applyGuess(puzzle, initialState, 'Pele');

    expect(wrongGuess.outcome).toBe('incorrect');
    expect(wrongGuess.state.attempts).toBe(1);
    expect(wrongGuess.state.livesRemaining).toBe(4);
    expect(wrongGuess.state.normalizedIncorrectGuesses).toEqual(['pele']);

    const duplicateWrongGuess = applyGuess(puzzle, wrongGuess.state, '  Pelé!! ');

    expect(duplicateWrongGuess.outcome).toBe('duplicateIncorrect');
    expect(duplicateWrongGuess.state.attempts).toBe(1);
    expect(duplicateWrongGuess.state.livesRemaining).toBe(4);
    expect(duplicateWrongGuess.state.normalizedIncorrectGuesses).toEqual(['pele']);
  });

  it('reveals ordered hints per slot and stops after the third hint', () => {
    const initialState = createInitialGameState(puzzle);
    const firstHint = useHint(puzzle, initialState, hintedSlotId);

    expect(firstHint.outcome).toBe('revealed');
    expect(firstHint.hint?.type).toBe('alsoPlayedFor');
    expect(firstHint.revealedHintCount).toBe(1);

    const secondHint = useHint(puzzle, firstHint.state, hintedSlotId);
    const thirdHint = useHint(puzzle, secondHint.state, hintedSlotId);
    const fourthHint = useHint(puzzle, thirdHint.state, hintedSlotId);

    expect(secondHint.hint?.type).toBe('nationality');
    expect(thirdHint.hint?.type).toBe('firstName');
    expect(fourthHint.outcome).toBe('alreadyUsedAll');
    expect(getHintsUsedCount(thirdHint.state, hintedSlotId)).toBe(3);
    expect(getTotalHintsUsed(thirdHint.state)).toBe(3);

    const solvedState = applyGuess(puzzle, thirdHint.state, hintedGuess).state;
    const solvedHint = useHint(puzzle, solvedState, hintedSlotId);

    expect(solvedHint.outcome).toBe('alreadySolved');
  });

  it('computes completion score deterministically from solved-slot hint usage', () => {
    const initialState = createInitialGameState(puzzle);
    const hintedState = useHint(
      puzzle,
      useHint(puzzle, useHint(puzzle, initialState, hintedSlotId).state, hintedSlotId).state,
      hintedSlotId,
    ).state;
    const completedState = solveAllSlotsExcept([], hintedState);

    expect(completedState.status).toBe('completed');
    expect(completedState.completed).toBe(true);
    expect(completedState.livesRemaining).toBe(5);
    expect(completedState.attempts).toBe(22);
    expect(completedState.finalScore).toBe(214);
    expect(completedState.revealedSlotIds).toHaveLength(22);
    expect(completedState.solvedSlotIds).toHaveLength(22);
  });

  it('ends on the fifth unique wrong guess and scores only solved players', () => {
    let state = createInitialGameState(puzzle);

    state = useHint(puzzle, state, hintedSlotId).state;
    state = applyGuess(puzzle, state, cleanSolvedGuess).state;

    for (const wrongGuess of ['Pele', 'Maradona', 'Cruyff', 'Zidane', 'Ronaldo']) {
      state = applyGuess(puzzle, state, wrongGuess).state;
    }

    expect(state.status).toBe('gameOver');
    expect(state.gameOver).toBe(true);
    expect(state.livesRemaining).toBe(0);
    expect(state.attempts).toBe(6);
    expect(state.finalScore).toBe(10);
    expect(state.revealedSlotIds).toHaveLength(22);
    expect(state.solvedSlotIds).toEqual([cleanSolvedSlotId]);

    const blockedGuess = applyGuess(puzzle, state, hintedGuess);
    expect(blockedGuess.outcome).toBe('blocked');
  });

  it('gives up, reveals remaining slots, and preserves solved-slot penalties', () => {
    let state = createInitialGameState(puzzle);

    state = useHint(puzzle, state, hintedSlotId).state;
    state = applyGuess(puzzle, state, hintedGuess).state;
    state = applyGuess(puzzle, state, cleanSolvedGuess).state;

    const result = giveUp(puzzle, state);

    expect(result.outcome).toBe('gaveUp');
    expect(result.state.status).toBe('gaveUp');
    expect(result.state.finalScore).toBe(18);
    expect(result.state.revealedSlotIds).toHaveLength(22);
    expect(result.state.solvedSlotIds).toEqual([
      hintedSlotId,
      cleanSolvedSlotId,
    ]);

    const blockedHint = useHint(puzzle, result.state, 'slot-oliver-kahn');
    expect(blockedHint.outcome).toBe('blocked');
  });
});
