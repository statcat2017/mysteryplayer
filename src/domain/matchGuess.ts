import { normalizeAnswer } from './normalizeAnswer';
import { PuzzleRecord } from './puzzleTypes';

export interface GuessMatchResult {
  normalizedGuess: string;
  matchingSlotIds: string[];
  matchedPlayerIds: string[];
  alreadyRevealed: boolean;
}

export function matchGuess(
  puzzle: PuzzleRecord,
  guess: string,
  revealedSlotIds: Iterable<string> = [],
): GuessMatchResult {
  const normalizedGuess = normalizeAnswer(guess);
  const revealed = new Set(revealedSlotIds);

  if (!normalizedGuess) {
    return {
      normalizedGuess,
      matchingSlotIds: [],
      matchedPlayerIds: [],
      alreadyRevealed: false,
    };
  }

  const playersById = new Map(puzzle.players.map((player) => [player.id, player]));
  const knownMatchingSlots = puzzle.guessableSlots.filter((slot) => {
    const player = playersById.get(slot.playerId);
    return (
      player?.answerAliases.some(
        (alias) => normalizeAnswer(alias.value) === normalizedGuess,
      ) ?? false
    );
  });

  const matchingSlots = knownMatchingSlots.filter((slot) => !revealed.has(slot.id));

  return {
    normalizedGuess,
    matchingSlotIds: matchingSlots.map((slot) => slot.id),
    matchedPlayerIds: matchingSlots.map((slot) => slot.playerId),
    alreadyRevealed: knownMatchingSlots.length > 0 && matchingSlots.length === 0,
  };
}
