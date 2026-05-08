import { Hint } from '../domain/puzzleTypes';

interface HintControlsProps {
  disabled?: boolean;
  hints: Hint[];
  onRevealNextHint: () => void;
  revealedCount: number;
  solved?: boolean;
}

const HINT_LABELS: Record<Hint['type'], string> = {
  alsoPlayedFor: 'Also played for',
  nationality: 'Nationality',
  clubAtMatchTime: 'Club at match time',
  firstName: 'First name',
  other: 'Hint',
};

export function HintControls({
  disabled = false,
  hints,
  onRevealNextHint,
  revealedCount,
  solved = false,
}: HintControlsProps) {
  const nextHint = hints[revealedCount];

  return (
    <div className="hint-panel">
      <div className="hint-panel__header">
        <span>Hints</span>
        <span>
          {revealedCount}/{hints.length} used
        </span>
      </div>

      {revealedCount > 0 ? (
        <ol className="hint-panel__list">
          {hints.slice(0, revealedCount).map((hint) => (
            <li key={`${hint.order}-${hint.type}`} className="hint-panel__item">
              <span className="hint-panel__label">{HINT_LABELS[hint.type]}</span>
              <span>{hint.text}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="hint-panel__empty">No hints used for this player yet.</p>
      )}

      {nextHint && !solved ? (
        <button
          className="hint-panel__button"
          type="button"
          disabled={disabled}
          onClick={onRevealNextHint}
        >
          Use hint {nextHint.order}
        </button>
      ) : null}
    </div>
  );
}
