import { getSlotRevealState, getSlotScore } from '../app/puzzleGame';
import { GameState, getHintsUsedCount } from '../domain/gameState';
import { PuzzleRecord, TeamRecord } from '../domain/puzzleTypes';
import { PlayerSlot } from './PlayerSlot';

interface LineupBoardProps {
  onRevealNextHint: (slotId: string) => void;
  puzzle: PuzzleRecord;
  session: GameState;
  team: TeamRecord;
}

export function LineupBoard({
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

  return (
    <section className="lineup-board" aria-labelledby={`team-${team.id}`}>
      <div className="lineup-board__header">
        <div>
          <p className="lineup-board__eyebrow">{team.side}</p>
          <h2 id={`team-${team.id}`}>{team.name}</h2>
        </div>
        <div className="lineup-board__summary">
          <p className="lineup-board__meta">
            {solvedCount}/11 solved
            {team.manager ? ` | ${team.manager}` : ''}
          </p>
        </div>
      </div>

      <ol className="lineup-board__grid">
        {lineups.map((lineup) => {
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
              terminalLabel={terminalLabel}
              onRevealNextHint={onRevealNextHint}
            />
          );
        })}
      </ol>
    </section>
  );
}
