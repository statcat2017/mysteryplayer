import { getSlotRevealState, getSlotScore } from '../app/puzzleGame';
import { GameState, getHintsUsedCount } from '../domain/gameState';
import { PuzzleRecord, TeamRecord } from '../domain/puzzleTypes';
import { PlayerSlot } from './PlayerSlot';

interface LineupBoardProps {
  mirrored?: boolean;
  onRevealNextHint: (slotId: string) => void;
  puzzle: PuzzleRecord;
  session: GameState;
  team: TeamRecord;
}

const FORMATION_ORDER = ['goalkeeper', 'defence', 'midfield', 'attack'] as const;

const POSITION_ORDER: Record<string, number> = {
  LB: 0,
  LWB: 0,
  LM: 0,
  LW: 0,
  LF: 0,
  RB: 4,
  RWB: 4,
  RM: 4,
  RW: 4,
  RF: 4,
  SW: 2,
  CB: 2,
  CM: 2,
  DM: 2,
  AM: 2,
  CF: 2,
  FW: 2,
  GK: 2,
};

export function LineupBoard({
  mirrored = false,
  onRevealNextHint,
  puzzle,
  session,
  team,
}: LineupBoardProps) {
  const playersById = new Map(puzzle.players.map((player) => [player.id, player]));
  const slotsByLineupId = new Map(
    puzzle.guessableSlots.map((slot) => [slot.lineupEntryId, slot]),
  );
  const lineups = puzzle.lineups
    .filter((lineup) => lineup.teamId === team.id)
    .sort((left, right) => left.displayOrder - right.displayOrder);
  const solvedCount = lineups.reduce((count, lineup) => {
    const slot = slotsByLineupId.get(lineup.id);
    return count + (slot && session.solvedSlotIds.includes(slot.id) ? 1 : 0);
  }, 0);
  const lineupsByGroup = new Map(
    FORMATION_ORDER.map((group) => [
      group,
      lineups
        .filter((lineup) => (lineup.lineupGroup ?? 'midfield') === group)
        .sort((left, right) => {
          const leftRank = POSITION_ORDER[left.positionLabel ?? ''] ?? 2;
          const rightRank = POSITION_ORDER[right.positionLabel ?? ''] ?? 2;
          const rankDiff = mirrored ? rightRank - leftRank : leftRank - rightRank;

          if (rankDiff !== 0) {
            return rankDiff;
          }

          return left.displayOrder - right.displayOrder;
        }),
    ]),
  );

  return (
    <section
      className={`lineup-board ${mirrored ? 'lineup-board--mirrored' : ''}`}
      aria-labelledby={`team-${team.id}`}
    >
      <div className="lineup-board__header">
        <h2 id={`team-${team.id}`}>{team.name}</h2>
        <div className="lineup-board__summary">
          <p className="lineup-board__meta">{solvedCount}/11 solved</p>
        </div>
      </div>

      <ol
        className="lineup-board__grid"
        aria-label={`${team.name} starting lineup, ${solvedCount} of ${lineups.length} solved`}
      >
        {FORMATION_ORDER.map((group) => (
          <li key={group} className="lineup-board__column">
            <ol
              className={`lineup-board__stack lineup-board__stack--${
                (lineupsByGroup.get(group) ?? []).length === 1 ? 'single' : 'spread'
              }`}
            >
              {(lineupsByGroup.get(group) ?? []).map((lineup) => {
                const slot = slotsByLineupId.get(lineup.id);
                const revealState = slot ? getSlotRevealState(session, slot.id) : 'hidden';
                const terminalLabel =
                  session.status === 'gaveUp'
                    ? 'Revealed after give up'
                    : session.status === 'gameOver'
                      ? 'Revealed after game over'
                      : undefined;

                return (
                  <PlayerSlot
                    key={lineup.id}
                    disabled={session.status !== 'inProgress'}
                    hintCount={slot ? getHintsUsedCount(session, slot.id) : 0}
                    lineup={lineup}
                    player={playersById.get(lineup.playerId)}
                    revealState={revealState}
                    score={slot ? getSlotScore(puzzle, session, slot.id) : 0}
                    slot={slot}
                    teamName={team.name}
                    terminalLabel={terminalLabel}
                    onRevealNextHint={onRevealNextHint}
                  />
                );
              })}
            </ol>
          </li>
        ))}
      </ol>
    </section>
  );
}
