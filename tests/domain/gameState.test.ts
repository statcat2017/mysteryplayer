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
    const firstGuess = applyGuess(puzzle, initialState, 'Leo Messi');

    expect(firstGuess.outcome).toBe('correct');
    expect(firstGuess.state.attempts).toBe(1);
    expect(firstGuess.state.livesRemaining).toBe(5);
    expect(firstGuess.matchedSlotIds).toEqual(['slot-argentina-10']);
    expect(isSlotRevealed(firstGuess.state, 'slot-argentina-10')).toBe(true);
    expect(getSolvedCount(firstGuess.state)).toBe(1);

    const repeatGuess = applyGuess(puzzle, firstGuess.state, 'Messi');

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
    const firstHint = useHint(puzzle, initialState, 'slot-argentina-10');

    expect(firstHint.outcome).toBe('revealed');
    expect(firstHint.hint?.type).toBe('alsoPlayedFor');
    expect(firstHint.revealedHintCount).toBe(1);

    const secondHint = useHint(puzzle, firstHint.state, 'slot-argentina-10');
    const thirdHint = useHint(puzzle, secondHint.state, 'slot-argentina-10');
    const fourthHint = useHint(puzzle, thirdHint.state, 'slot-argentina-10');

    expect(secondHint.hint?.type).toBe('clubAtMatchTime');
    expect(thirdHint.hint?.type).toBe('firstName');
    expect(fourthHint.outcome).toBe('alreadyUsedAll');
    expect(getHintsUsedCount(thirdHint.state, 'slot-argentina-10')).toBe(3);
    expect(getTotalHintsUsed(thirdHint.state)).toBe(3);

    const solvedState = applyGuess(puzzle, thirdHint.state, 'Messi').state;
    const solvedHint = useHint(puzzle, solvedState, 'slot-argentina-10');

    expect(solvedHint.outcome).toBe('alreadySolved');
  });

  it('computes completion score deterministically from solved-slot hint usage', () => {
    const initialState = createInitialGameState(puzzle);
    const hintedState = useHint(
      puzzle,
      useHint(puzzle, useHint(puzzle, initialState, 'slot-argentina-10').state, 'slot-argentina-10').state,
      'slot-argentina-10',
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

    state = useHint(puzzle, state, 'slot-argentina-10').state;
    state = applyGuess(puzzle, state, 'Kylian Mbappe').state;

    for (const wrongGuess of ['Pele', 'Maradona', 'Cruyff', 'Zidane', 'Ronaldo']) {
      state = applyGuess(puzzle, state, wrongGuess).state;
    }

    expect(state.status).toBe('gameOver');
    expect(state.gameOver).toBe(true);
    expect(state.livesRemaining).toBe(0);
    expect(state.attempts).toBe(6);
    expect(state.finalScore).toBe(10);
    expect(state.revealedSlotIds).toHaveLength(22);
    expect(state.solvedSlotIds).toEqual(['slot-france-11']);

    const blockedGuess = applyGuess(puzzle, state, 'Messi');
    expect(blockedGuess.outcome).toBe('blocked');
  });

  it('gives up, reveals remaining slots, and preserves solved-slot penalties', () => {
    let state = createInitialGameState(puzzle);

    state = useHint(puzzle, state, 'slot-argentina-10').state;
    state = applyGuess(puzzle, state, 'Messi').state;
    state = applyGuess(puzzle, state, 'Kylian Mbappe').state;

    const result = giveUp(puzzle, state);

    expect(result.outcome).toBe('gaveUp');
    expect(result.state.status).toBe('gaveUp');
    expect(result.state.finalScore).toBe(18);
    expect(result.state.revealedSlotIds).toHaveLength(22);
    expect(result.state.solvedSlotIds).toEqual([
      'slot-argentina-10',
      'slot-france-11',
    ]);

    const blockedHint = useHint(puzzle, result.state, 'slot-france-10');
    expect(blockedHint.outcome).toBe('blocked');
  });
});
