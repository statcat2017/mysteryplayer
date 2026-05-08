import { describe, expect, it } from 'vitest';
import { calculateSlotScore } from '../../src/domain/scoring';
import type { GuessableSlot } from '../../src/domain/puzzleTypes';

function createTestSlot(): GuessableSlot {
  return {
    id: 'slot-test',
    lineupEntryId: 'lineup-test',
    playerId: 'player-test',
    hiddenAtLaunch: true,
    hints: [
      {
        order: 1,
        type: 'alsoPlayedFor',
        text: 'Hint one',
        sources: ['source-1'],
        confidence: 'high',
        penaltyPoints: 5,
      },
      {
        order: 2,
        type: 'clubAtMatchTime',
        text: 'Hint two',
        sources: ['source-1'],
        confidence: 'high',
        penaltyPoints: 5,
      },
      {
        order: 3,
        type: 'firstName',
        text: 'Hint three',
        sources: ['source-1'],
        confidence: 'high',
        penaltyPoints: 5,
      },
    ],
  };
}

describe('scoring', () => {
  it('applies hint penalties in order for solved players', () => {
    expect(calculateSlotScore(createTestSlot(), 1)).toBe(5);
  });

  it('floors solved player score at two points', () => {
    expect(calculateSlotScore(createTestSlot(), 3)).toBe(2);
  });
});
