import { useState } from 'react';
import { GuessInput } from '../components/GuessInput';
import { LineupBoard } from '../components/LineupBoard';
import { ValidationSummary } from '../components/ValidationSummary';
import { selectPuzzleSeedForDate } from '../data/puzzleLoader';
import { matchGuess } from '../domain/matchGuess';
import { validatePuzzle } from '../domain/validatePuzzle';

function formatScoreline(homeTeam: string, awayTeam: string, home: number, away: number) {
  return `${homeTeam} ${home} - ${away} ${awayTeam}`;
}

export default function App() {
  const selectedSeed = selectPuzzleSeedForDate(new Date());
  const validation = selectedSeed ? validatePuzzle(selectedSeed.rawPuzzle) : undefined;
  const [revealedSlotIds, setRevealedSlotIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string>('Prototype shell ready.');

  if (!selectedSeed) {
    return (
      <main className="app-shell">
        <section className="hero-card">
          <p className="hero-card__eyebrow">Mystery Player</p>
          <h1>No puzzle data found</h1>
          <p>Add a JSON seed to `data/puzzles/` to render the daily puzzle shell.</p>
        </section>
      </main>
    );
  }

  if (!validation) {
    return null;
  }

  const puzzle = validation.puzzle;

  function handleGuess(rawGuess: string) {
    if (!puzzle) {
      return;
    }

    const match = matchGuess(puzzle, rawGuess, revealedSlotIds);

    if (!match.normalizedGuess) {
      setFeedback('Enter a player name to test alias matching.');
      return;
    }

    if (match.matchingSlotIds.length === 0) {
      setFeedback(
        match.alreadyRevealed
          ? `Already revealed: "${rawGuess.trim()}".`
          : `No matching starter found for "${rawGuess.trim()}".`,
      );
      return;
    }

    setRevealedSlotIds((current) => [...new Set([...current, ...match.matchingSlotIds])]);
    setFeedback(`Revealed ${match.matchingSlotIds.length} starter slot(s) for "${rawGuess.trim()}".`);
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="hero-card__eyebrow">Mystery Player prototype</p>
        <h1>Build-time loader and runtime validator</h1>
        <p className="hero-card__lede">
          The current app shell loads the daily puzzle JSON from the repository, validates the
          authored contract at runtime, and supports global alias matching to reveal starters.
        </p>
        <dl className="hero-card__facts">
          <div>
            <dt>Seed file</dt>
            <dd>{selectedSeed.sourcePath.replace('../../', '')}</dd>
          </div>
          <div>
            <dt>Puzzle ID</dt>
            <dd>{selectedSeed.puzzleId ?? 'Unknown'}</dd>
          </div>
          <div>
            <dt>Publish date</dt>
            <dd>{selectedSeed.publishDate ?? 'Unknown'}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{selectedSeed.status ?? 'Unknown'}</dd>
          </div>
        </dl>
      </section>

      <ValidationSummary validation={validation} />

      {puzzle ? (
        <>
          <section className="match-card" aria-labelledby="match-context">
            <div className="match-card__header">
              <div>
                <p className="match-card__eyebrow">{puzzle.match.competition}</p>
                <h2 id="match-context">
                  {formatScoreline(
                    puzzle.teams.find((team) => team.id === puzzle.match.homeTeamId)?.name ?? 'Home',
                    puzzle.teams.find((team) => team.id === puzzle.match.awayTeamId)?.name ?? 'Away',
                    puzzle.match.score.home,
                    puzzle.match.score.away,
                  )}
                </h2>
              </div>
              <p className="match-card__status">{puzzle.match.date}</p>
            </div>
            <p className="match-card__meta">
              {puzzle.match.stage ? `${puzzle.match.stage} · ` : ''}
              {puzzle.match.venue ? `${puzzle.match.venue}, ` : ''}
              {puzzle.match.city ? `${puzzle.match.city}, ` : ''}
              {puzzle.match.country ?? ''}
            </p>
            {puzzle.match.context ? <p className="match-card__context">{puzzle.match.context}</p> : null}
            <div className="match-card__summary">
              <span>{puzzle.lineups.length} starters loaded</span>
              <span>{puzzle.guessableSlots.length} guessable slots</span>
              <span>{puzzle.sources.length} sources tracked</span>
              <span>{revealedSlotIds.length} revealed in this session</span>
            </div>
          </section>

          <GuessInput onSubmitGuess={handleGuess} />

          <p className="feedback-banner" aria-live="polite">
            {feedback}
          </p>

          <section className="boards">
            {puzzle.teams.map((team) => (
              <LineupBoard
                key={team.id}
                puzzle={puzzle}
                team={team}
                revealedSlotIds={new Set(revealedSlotIds)}
              />
            ))}
          </section>
        </>
      ) : (
        <section className="hero-card">
          <p>The selected seed could not be rendered because validation failed.</p>
        </section>
      )}
    </main>
  );
}
