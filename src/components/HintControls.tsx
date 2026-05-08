import { Hint } from '../domain/puzzleTypes';

interface HintControlsProps {
  contextLabel?: string;
  disabled?: boolean;
  hints: Hint[];
  onRevealNextHint: () => void;
  revealedCount: number;
  solved?: boolean;
}

function formatHintText(hint: Hint) {
  const withoutPrefix = hint.text.replace(/^[^:]+:\s*/, '').trim();
  return withoutPrefix.replace(/\.$/, '');
}

export function HintControls({
  contextLabel,
  disabled = false,
  hints,
  onRevealNextHint,
  revealedCount,
  solved = false,
}: HintControlsProps) {
  const nextHint = hints[revealedCount];
  const hintRegionLabel = contextLabel ? `Hints for ${contextLabel}` : 'Player hints';
  const nextHintLabel = contextLabel
    ? `Reveal hint ${nextHint?.order} for ${contextLabel}`
    : nextHint
      ? `Reveal hint ${nextHint.order}`
      : undefined;

  return (
    <div className="hint-panel" aria-label={hintRegionLabel}>
      <ol className="hint-panel__list">
        {hints.slice(0, revealedCount).map((hint) => (
          <li key={`${hint.order}-${hint.type}`} className="hint-panel__item">
            <span className="hint-panel__chip-label">{formatHintText(hint)}</span>
          </li>
        ))}
      </ol>

      <div className="hint-panel__actions">
        {nextHint && !solved ? (
          <button
            className="hint-panel__button"
            type="button"
            disabled={disabled}
            aria-label={nextHintLabel}
            onClick={onRevealNextHint}
          >
            {`H${nextHint.order}`}
          </button>
        ) : null}
      </div>
    </div>
  );
}
