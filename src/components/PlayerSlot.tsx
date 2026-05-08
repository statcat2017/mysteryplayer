import { SlotRevealState } from '../app/puzzleGame';
import { GuessableSlot, LineupEntry, PlayerRecord } from '../domain/puzzleTypes';
import { HintControls } from './HintControls';

interface PlayerSlotProps {
  disabled?: boolean;
  hintCount: number;
  lineup: LineupEntry;
  onRevealNextHint: (slotId: string) => void;
  player?: PlayerRecord;
  revealState: SlotRevealState;
  score: number;
  slot?: GuessableSlot;
  terminalLabel?: string;
}

export function PlayerSlot({
  disabled = false,
  hintCount,
  lineup,
  onRevealNextHint,
  player,
  revealState,
  score,
  slot,
  terminalLabel,
}: PlayerSlotProps) {
  const visibleName =
    revealState === 'hidden' ? 'Hidden player' : player?.displayName ?? 'Missing player';
  const slotTone =
    revealState === 'solved'
      ? 'is-solved'
      : revealState === 'revealed-after-end'
        ? 'is-revealed'
        : 'is-hidden';

  return (
    <li className={`player-slot ${slotTone}`}>
      <div className="player-slot__header">
        <span className="player-slot__order">{lineup.displayOrder}</span>
        <span className="player-slot__meta">
          {lineup.positionLabel ?? 'Starter'}
          {lineup.shirtNumber ? ` | #${lineup.shirtNumber}` : ''}
        </span>
      </div>

      <div className="player-slot__body">
        <strong className="player-slot__name">{visibleName}</strong>
        <p className="player-slot__group">
          {lineup.lineupGroup ? lineup.lineupGroup : 'Starting XI'}
        </p>
      </div>

      <div className="player-slot__footer">
        <span className="player-slot__state">
          {revealState === 'solved'
            ? `Solved | ${score} pts`
            : revealState === 'revealed-after-end'
              ? `${terminalLabel ?? 'Revealed'} | 0 pts`
              : `${slot?.hints.length ?? 0} hints available`}
        </span>
      </div>

      {slot ? (
        <HintControls
          disabled={disabled}
          hints={slot.hints}
          revealedCount={hintCount}
          solved={revealState !== 'hidden'}
          onRevealNextHint={() => onRevealNextHint(slot.id)}
        />
      ) : null}
    </li>
  );
}
