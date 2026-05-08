import {
  getStatusLabel,
  getCurrentScore,
} from '../app/puzzleGame';
import {
  GameState,
  getSolvedCount,
  getTotalHintsUsed,
  INITIAL_LIVES,
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
  const livesLost = INITIAL_LIVES - session.livesRemaining;
  const disabled = session.status !== 'inProgress';

  return (
    <aside className="score-card" aria-labelledby="game-status">
      <div className="score-card__header">
        <div>
          <p className="score-card__eyebrow">Daily status</p>
          <h2 id="game-status">{getStatusLabel(session.status)}</h2>
        </div>
        <span className={`score-card__tag score-card__tag--${session.status}`}>
          {getStatusLabel(session.status)}
        </span>
      </div>

      <dl className="score-card__grid">
        <div>
          <dt>Score</dt>
          <dd>
            {score}/{maxScore}
          </dd>
        </div>
        <div>
          <dt>Solved</dt>
          <dd>
            {solved}/{puzzle.guessableSlots.length}
          </dd>
        </div>
        <div>
          <dt>Attempts</dt>
          <dd>{session.attempts}</dd>
        </div>
        <div>
          <dt>Lives</dt>
          <dd>
            {session.livesRemaining}/{INITIAL_LIVES}
          </dd>
        </div>
        <div>
          <dt>Hints used</dt>
          <dd>{hintsUsed}</dd>
        </div>
        <div>
          <dt>Misses</dt>
          <dd>{livesLost}</dd>
        </div>
      </dl>

      <p className="score-card__note">
        Correct guesses reveal players anywhere on the board. Duplicate misses do not cost extra
        lives.
      </p>

      <button
        className="score-card__button"
        type="button"
        disabled={disabled}
        onClick={onGiveUp}
      >
        Give up and reveal the lineup
      </button>

      <button
        className="score-card__button score-card__button--secondary"
        type="button"
        disabled={false}
        onClick={onReset}
      >
        Reset puzzle progress
      </button>
    </aside>
  );
}
