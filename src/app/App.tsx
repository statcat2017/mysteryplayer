import { useEffect, useState } from 'react';
import { GuessInput } from '../components/GuessInput';
import { LineupBoard } from '../components/LineupBoard';
import { ScoreSummary } from '../components/ScoreSummary';
import { ShareResult } from '../components/ShareResult';
import { ValidationSummary } from '../components/ValidationSummary';
import { selectPuzzleSeedForDate } from '../data/puzzleLoader';
import {
  buildShareText,
  formatGiveUpAnnouncement,
  formatGuessAnnouncement,
  formatHintAnnouncement,
  getCurrentScore,
  getStatusLabel,
} from './puzzleGame';
import {
  applyGuess,
  createInitialGameState,
  GameState,
  getSolvedCount,
  giveUp,
  useHint,
} from '../domain/gameState';
import { calculateMaximumScore } from '../domain/scoring';
import {
  clearLocalProgress,
  loadOrCreateLocalProgress,
  saveLocalProgress,
} from '../storage/localProgress';
import { validatePuzzle } from '../domain/validatePuzzle';

function formatScoreline(homeTeam: string, awayTeam: string, home: number, away: number) {
  return `${homeTeam} ${home} - ${away} ${awayTeam}`;
}

function formatAttendance(attendance?: number) {
  return typeof attendance === 'number'
    ? new Intl.NumberFormat('en-GB').format(attendance)
    : 'Unknown';
}

function formatPenaltyNote(home: number, away: number) {
  return `Penalties ${home}-${away}`;
}

function getSessionIntro() {
  return 'Guess a player from either starting XI. Correct answers reveal names anywhere on the board.';
}

function getTerminalHeadline(session: GameState) {
  switch (session.status) {
    case 'completed':
      return 'Puzzle solved';
    case 'gaveUp':
      return 'Lineup revealed after give up';
    case 'gameOver':
      return 'Out of lives';
    default:
      return 'Daily puzzle live';
  }
}

function getTerminalBody(session: GameState) {
  switch (session.status) {
    case 'completed':
      return 'You found every starter. The spoiler-safe share block is ready below.';
    case 'gaveUp':
      return 'The remaining names are now visible below, and unsolved players score zero points.';
    case 'gameOver':
      return 'Five unique misses ended the run. The full lineups are visible below for review.';
    default:
      return '';
  }
}

export default function App() {
  const selectedSeed = selectPuzzleSeedForDate(new Date());
  const validation = selectedSeed ? validatePuzzle(selectedSeed.rawPuzzle) : undefined;
  const [session, setSession] = useState<GameState | null>(null);
  const [announcement, setAnnouncement] = useState(getSessionIntro);
  const showValidationSummary =
    Boolean(validation) &&
    (!validation?.valid || validation.errors.length > 0 || validation.warnings.length > 0);

  useEffect(() => {
    if (!validation?.puzzle) {
      setSession(null);
      return;
    }

    if (typeof window === 'undefined') {
      setSession(createInitialGameState(validation.puzzle));
      return;
    }

    setSession(loadOrCreateLocalProgress(window.localStorage, validation.puzzle));
    setAnnouncement(getSessionIntro());
  }, [validation?.puzzle?.puzzleId]);

  useEffect(() => {
    if (!validation?.puzzle || !session || typeof window === 'undefined') {
      return;
    }

    if (session.puzzleId !== validation.puzzle.puzzleId) {
      return;
    }

    saveLocalProgress(window.localStorage, validation.puzzle, session);
  }, [session, validation?.puzzle?.puzzleId]);

  if (!selectedSeed) {
    return (
      <main className="app-shell">
        <section className="empty-state">
          <p className="empty-state__eyebrow">Mystery Player</p>
          <h1>No puzzle data found</h1>
          <p>Add a JSON seed to `data/puzzles/` to render the daily puzzle.</p>
        </section>
      </main>
    );
  }

  if (!validation?.valid || !validation.puzzle) {
    return (
      <main className="app-shell">
        <section className="empty-state">
          <p className="empty-state__eyebrow">Mystery Player</p>
          <h1>Selected puzzle failed validation</h1>
          <p>The daily screen is blocked until the seed contract issues are fixed.</p>
        </section>
        {validation ? <ValidationSummary validation={validation} /> : null}
      </main>
    );
  }

  const puzzle = validation.puzzle;

  if (!session) {
    return (
      <main className="app-shell">
        <section className="empty-state">
          <p className="empty-state__eyebrow">Mystery Player</p>
          <h1>Loading puzzle state</h1>
          <p>Preparing today&apos;s saved progress.</p>
        </section>
      </main>
    );
  }

  const gameState = session;
  const homeTeam = puzzle.teams.find((team) => team.id === puzzle.match.homeTeamId);
  const awayTeam = puzzle.teams.find((team) => team.id === puzzle.match.awayTeamId);
  const solvedCount = getSolvedCount(gameState);
  const score = getCurrentScore(puzzle, gameState);
  const maxScore = calculateMaximumScore(puzzle);
  const shareSummary = buildShareText(puzzle, gameState);
  const puzzleLabel = puzzle.puzzleNumber ? `#${puzzle.puzzleNumber}` : puzzle.publishDate;

  function handleGuess(rawGuess: string) {
    const result = applyGuess(puzzle, gameState, rawGuess);
    setSession(result.state);
    setAnnouncement(formatGuessAnnouncement(puzzle, result));
  }

  function handleRevealHint(slotId: string) {
    const result = useHint(puzzle, gameState, slotId);
    setSession(result.state);
    setAnnouncement(formatHintAnnouncement(result));
  }

  function handleGiveUp() {
    if (gameState.status !== 'inProgress') {
      return;
    }

    const confirmed = window.confirm('Reveal the full lineup and end this puzzle?');

    if (!confirmed) {
      return;
    }

    const result = giveUp(puzzle, gameState);
    setSession(result.state);
    setAnnouncement(formatGiveUpAnnouncement(puzzle, result));
  }

  function handleReset() {
    if (typeof window === 'undefined') {
      return;
    }

    clearLocalProgress(window.localStorage, puzzle);
    const nextSession = createInitialGameState(puzzle);

    setSession(nextSession);
    setAnnouncement('Progress reset. The current puzzle has restarted.');
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="hero-card__topline">
          <p className="hero-card__eyebrow">Mystery Player {puzzleLabel}</p>
          <span className={`hero-card__status hero-card__status--${gameState.status}`}>
            {getStatusLabel(gameState.status)}
          </span>
        </div>

        <div className="hero-card__headline">
          <div>
            <h1>
              {formatScoreline(
                homeTeam?.name ?? 'Home',
                awayTeam?.name ?? 'Away',
                puzzle.match.score.home,
                puzzle.match.score.away,
              )}
            </h1>
            <p className="hero-card__lede">
              {puzzle.match.competition}
              {puzzle.match.stage ? ` | ${puzzle.match.stage}` : ''}
              {puzzle.match.extraTime ? ' | After extra time' : ''}
              {puzzle.match.penalties
                ? ` | ${formatPenaltyNote(
                    puzzle.match.penalties.home,
                    puzzle.match.penalties.away,
                  )}`
                : ''}
            </p>
          </div>

          <dl className="hero-card__facts">
            <div>
              <dt>Date</dt>
              <dd>{puzzle.match.date}</dd>
            </div>
            <div>
              <dt>Venue</dt>
              <dd>{puzzle.match.venue ?? 'Unknown'}</dd>
            </div>
            <div>
              <dt>Attendance</dt>
              <dd>{formatAttendance(puzzle.match.attendance)}</dd>
            </div>
            <div>
              <dt>Progress</dt>
              <dd>
                {solvedCount}/{puzzle.guessableSlots.length} solved
              </dd>
            </div>
          </dl>
        </div>

        {puzzle.match.context ? <p className="hero-card__context">{puzzle.match.context}</p> : null}
      </section>

      <div className="game-layout">
        <section className="game-stage">
          <section className="control-card" aria-labelledby="guess-panel">
            <div className="control-card__header">
              <div>
                <p className="control-card__eyebrow">Global guessing</p>
                <h2 id="guess-panel">One input for both teams</h2>
              </div>
              <p className="control-card__score">
                Score {score}/{maxScore}
              </p>
            </div>

            <GuessInput
              disabled={gameState.status !== 'inProgress'}
              helperText="Guesses apply across all 22 hidden starters. Repeating a wrong normalized guess will not cost another life."
              onSubmitGuess={handleGuess}
            />

            <p className="feedback-banner" aria-live="polite">
              {announcement}
            </p>

            {gameState.status !== 'inProgress' ? (
              <section className="result-banner" aria-labelledby="result-summary">
                <p className="result-banner__eyebrow">Summary</p>
                <h3 id="result-summary">{getTerminalHeadline(gameState)}</h3>
                <p>{getTerminalBody(gameState)}</p>
              </section>
            ) : null}
          </section>

          {showValidationSummary && validation ? (
            <ValidationSummary validation={validation} />
          ) : null}

          <section className="boards" aria-label="Team lineups">
            {puzzle.teams.map((team) => (
              <LineupBoard
                key={team.id}
                onRevealNextHint={handleRevealHint}
                puzzle={puzzle}
                session={gameState}
                team={team}
              />
            ))}
          </section>
        </section>

        <div className="status-rail">
          <ScoreSummary
            onGiveUp={handleGiveUp}
            onReset={handleReset}
            puzzle={puzzle}
            session={gameState}
          />

          {gameState.status !== 'inProgress' ? <ShareResult summary={shareSummary} /> : null}
        </div>
      </div>
    </main>
  );
}
