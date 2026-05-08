import {
  getStatusLabel,
  getCurrentScore,
} from '../app/puzzleGame';
import {
  GameState,
  getSolvedCount,
  getTotalHintsUsed,
} from '../domain/gameState';
import { PuzzleRecord } from '../domain/puzzleTypes';
import { calculateMaximumScore } from '../domain/scoring';

interface ScoreSummaryProps {
  onGiveUp: () => void;
  onReset: () => void;
  puzzle: PuzzleRecord;
  session: GameState;
}

export function ScoreSummary({ onGiveUp, onReset, puzzle, session }: ScoreSummaryProps) {
  const solved = getSolvedCount(session);
  const hintsUsed = getTotalHintsUsed(session);
  const score = getCurrentScore(puzzle, session);
  const maxScore = calculateMaximumScore(puzzle);
  const disabled = session.status !== 'inProgress';
  const livesProgressLabel =
    session.livesRemaining === 1 ? '1 life remaining' : `${session.livesRemaining} lives remaining`;

  return (
    <aside className="score-card" aria-labelledby="game-status">
      <div className="score-card__summary">
        <p className="score-card__eyebrow">Score</p>
        <h2 id="game-status">
          {score}/{maxScore}
        </h2>
        <span className={`score-card__tag score-card__tag--${session.status}`} aria-live="polite">
          {getStatusLabel(session.status)}
        </span>
      </div>

      <dl className="score-card__grid">
        <div>
          <dt>Solved</dt>
          <dd>{solved}/22</dd>
        </div>
        <div>
          <dt>Attempts</dt>
          <dd>{session.attempts}</dd>
        </div>
        <div>
          <dt>Hints used</dt>
          <dd>{hintsUsed}</dd>
        </div>
      </dl>

      <div className="score-card__lives" aria-label={livesProgressLabel}>
        {Array.from({ length: 5 }, (_, index) => {
          const active = index < session.livesRemaining;

          return (
            <span
              key={index}
              className={`score-card__life ${active ? 'is-active' : 'is-lost'}`}
              aria-hidden="true"
            />
          );
        })}
      </div>

      <div className="score-card__actions">
        <button
          className="score-card__button"
          type="button"
          disabled={disabled}
          onClick={onGiveUp}
        >
          Give up
        </button>

        <button
          className="score-card__button score-card__button--secondary"
          type="button"
          disabled={false}
          onClick={onReset}
        >
          Reset
        </button>
      </div>
    </aside>
  );
}
