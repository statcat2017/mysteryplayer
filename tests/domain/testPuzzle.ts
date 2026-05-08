import seedPuzzle from '../../data/puzzles/2026-05-08.json';
import { validatePuzzle } from '../../src/domain/validatePuzzle';

export function getTestPuzzle() {
  const validation = validatePuzzle(structuredClone(seedPuzzle));

  if (!validation.valid || !validation.puzzle) {
    throw new Error('Seed puzzle should validate inside domain tests.');
  }

  return validation.puzzle;
}
