import { useEffect, useState } from 'react';
import { GuessInput } from '../components/GuessInput';
import { LineupBoard } from '../components/LineupBoard';
import { ScoreSummary } from '../components/ScoreSummary';
import { ValidationSummary } from '../components/ValidationSummary';
import { selectPuzzleSeedForDate } from '../data/puzzleLoader';
import {
  formatGiveUpAnnouncement,
  formatGuessAnnouncement,
  formatHintAnnouncement,
} from './puzzleGame';
import {
  applyGuess,
  createInitialGameState,
  GameState,
  giveUp,
  useHint,
} from '../domain/gameState';
import {
  clearLocalProgress,
  loadOrCreateLocalProgress,
  saveLocalProgress,
} from '../storage/localProgress';
import { validatePuzzle } from '../domain/validatePuzzle';

function formatAttendance(attendance?: number) {
  return typeof attendance === 'number'
    ? new Intl.NumberFormat('en-GB').format(attendance)
    : 'Unknown';
}

function formatPenaltyNote(home: number, away: number) {
  return `Penalties ${home}-${away}`;
}

function getSessionIntro() {
  return 'Guess any starter from either side.';
}

function getGuessDisabledReason(session: GameState) {
  switch (session.status) {
    case 'completed':
      return 'Guessing is locked because every starter has been solved.';
    case 'gaveUp':
      return 'Guessing is locked because the lineup was revealed after giving up.';
    case 'gameOver':
      return 'Guessing is locked because all five lives have been used.';
    default:
      return undefined;
  }
}

function getTerminalHeadline(session: GameState) {
  switch (session.status) {
    case 'completed':
      return 'Solved';
    case 'gaveUp':
      return 'Gave up';
    case 'gameOver':
      return 'Out of lives';
    default:
      return 'Live';
  }
}

function getTerminalBody(session: GameState) {
  switch (session.status) {
    case 'completed':
      return 'All starters found.';
    case 'gaveUp':
      return 'Remaining players revealed.';
    case 'gameOver':
      return 'Five misses used.';
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
  const guessDisabledReason = getGuessDisabledReason(gameState);

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
      <section className="hero-card hero-card--compact" aria-label="Match details">
        <div className="hero-card__match-strip">
          <p className="hero-card__team hero-card__team--home">{homeTeam?.name ?? 'Home'}</p>
          <div className="hero-card__score-strip">
            <h1>
              {puzzle.match.score.home} - {puzzle.match.score.away}
            </h1>
            {puzzle.match.penalties ? (
              <p className="hero-card__penalties">
                {formatPenaltyNote(puzzle.match.penalties.home, puzzle.match.penalties.away)}
              </p>
            ) : null}
          </div>
          <p className="hero-card__team hero-card__team--away">{awayTeam?.name ?? 'Away'}</p>
        </div>

        <dl className="hero-card__meta-strip">
          <div>
            <dt>Venue</dt>
            <dd>{puzzle.match.venue ?? 'Unknown'}</dd>
          </div>
          <div>
            <dt>Attendance</dt>
            <dd>{formatAttendance(puzzle.match.attendance)}</dd>
          </div>
        </dl>
      </section>

      <section className="control-card control-card--slim" aria-labelledby="guess-panel">
        <h2 id="guess-panel" className="visually-hidden">
          Guess any player from either XI
        </h2>

        <div className="control-card__guess-strip">
          <GuessInput
            disabled={gameState.status !== 'inProgress'}
            disabledReason={guessDisabledReason}
            helperText={undefined}
            onSubmitGuess={handleGuess}
          />
        </div>

        <div className="control-card__feedback-strip">
          <p
            className={`feedback-banner feedback-banner--${gameState.status}`}
            role="status"
            aria-live="polite"
          >
            {announcement}
          </p>

          {gameState.status !== 'inProgress' ? (
            <section
              className={`result-banner result-banner--${gameState.status}`}
              aria-labelledby="result-summary"
            >
              <h3 id="result-summary">
                {getTerminalHeadline(gameState)}: {getTerminalBody(gameState)}
              </h3>
            </section>
          ) : null}
        </div>
      </section>

      {showValidationSummary && validation ? <ValidationSummary validation={validation} /> : null}

      <section className="boards" aria-label="Team lineups">
        {puzzle.teams.map((team, index) => (
          <LineupBoard
            key={team.id}
            mirrored={index === 1}
            onRevealNextHint={handleRevealHint}
            puzzle={puzzle}
            session={gameState}
            team={team}
          />
        ))}
      </section>
      <ScoreSummary
        onGiveUp={handleGiveUp}
        onReset={handleReset}
        puzzle={puzzle}
        session={gameState}
      />
    </main>
  );
}
