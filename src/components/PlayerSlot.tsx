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
  teamName?: string;
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
  teamName,
  terminalLabel,
}: PlayerSlotProps) {
  const isHidden = revealState === 'hidden';
  const isSolved = revealState === 'solved';
  const visibleName = isHidden ? '' : player?.displayName ?? 'Missing player';
  const slotTone =
    isSolved
      ? 'is-solved'
      : revealState === 'revealed-after-end'
        ? 'is-revealed'
        : 'is-hidden';
  const stateLabel =
    isSolved
      ? `Solved for ${score} points`
      : revealState === 'revealed-after-end'
        ? `${terminalLabel ?? 'Revealed'} for 0 points`
        : 'Hidden player';
  const scoreToken = revealState === 'revealed-after-end' ? '0 pts' : `${score} pts`;
  const metaLabel = lineup.positionLabel ?? 'Starter';
  const slotContext = `${teamName ? `${teamName} ` : ''}${lineup.positionLabel ?? 'Starter'}${
    lineup.shirtNumber ? ` #${lineup.shirtNumber}` : ` slot ${lineup.displayOrder}`
  }`;

  return (
    <li
      className={`player-slot ${slotTone}`}
      aria-label={`${slotContext}, ${isHidden ? 'Hidden player' : visibleName}, ${stateLabel}`}
    >
      {isSolved ? (
        <div className="player-slot__solved">
          <strong className="player-slot__solved-name">{visibleName}</strong>
        </div>
      ) : (
        <div className="player-slot__body">
          <div className="player-slot__identity">
            <span className="player-slot__order">{lineup.shirtNumber ?? lineup.displayOrder}</span>
            <div>
              {visibleName ? <strong className="player-slot__name">{visibleName}</strong> : null}
              <p className="player-slot__meta">{metaLabel}</p>
            </div>
            {!isHidden ? (
              <span className={`player-slot__state player-slot__state--${revealState}`}>
                {scoreToken}
              </span>
            ) : null}
          </div>

          {slot ? (
            <HintControls
              contextLabel={slotContext}
              disabled={disabled}
              hints={slot.hints}
              revealedCount={hintCount}
              solved={revealState !== 'hidden'}
              onRevealNextHint={() => onRevealNextHint(slot.id)}
            />
          ) : null}
        </div>
      )}
    </li>
  );
}
