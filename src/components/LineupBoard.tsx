import { PuzzleRecord, TeamRecord } from '../domain/puzzleTypes';

interface LineupBoardProps {
  puzzle: PuzzleRecord;
  team: TeamRecord;
  revealedSlotIds: Set<string>;
}

export function LineupBoard({ puzzle, team, revealedSlotIds }: LineupBoardProps) {
  const playersById = new Map(puzzle.players.map((player) => [player.id, player]));
  const slotsByLineupId = new Map(
    puzzle.guessableSlots.map((slot) => [slot.lineupEntryId, slot]),
  );

  const lineups = puzzle.lineups
    .filter((lineup) => lineup.teamId === team.id)
    .sort((left, right) => left.displayOrder - right.displayOrder);

  return (
    <section className="lineup-board" aria-labelledby={`team-${team.id}`}>
      <div className="lineup-board__header">
        <div>
          <p className="lineup-board__eyebrow">{team.side}</p>
          <h2 id={`team-${team.id}`}>{team.name}</h2>
        </div>
        {team.manager ? <p className="lineup-board__meta">Manager: {team.manager}</p> : null}
      </div>
      <ol className="lineup-board__grid">
        {lineups.map((lineup) => {
          const slot = slotsByLineupId.get(lineup.id);
          const player = playersById.get(lineup.playerId);
          const revealed = slot ? revealedSlotIds.has(slot.id) : false;

          return (
            <li key={lineup.id} className="player-slot">
              <div className="player-slot__header">
                <span className="player-slot__order">{lineup.displayOrder}</span>
                <span className="player-slot__meta">
                  {lineup.positionLabel ?? 'Starter'}
                  {lineup.shirtNumber ? ` • #${lineup.shirtNumber}` : ''}
                </span>
              </div>
              <strong className="player-slot__name">
                {revealed ? player?.displayName ?? 'Missing player' : 'Hidden player'}
              </strong>
              <p className="player-slot__group">
                {lineup.lineupGroup ? `Group: ${lineup.lineupGroup}` : 'Lineup metadata ready'}
              </p>
              {slot ? (
                <details className="player-slot__hints">
                  <summary>{slot.hints.length} hints ready</summary>
                  <ol>
                    {slot.hints.map((hint) => (
                      <li key={`${slot.id}-${hint.order}`}>{hint.text}</li>
                    ))}
                  </ol>
                </details>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
