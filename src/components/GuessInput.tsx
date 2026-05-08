import { FormEvent, useState } from 'react';

interface GuessInputProps {
  disabled?: boolean;
  disabledReason?: string;
  helperText?: string;
  onSubmitGuess: (guess: string) => void;
}

export function GuessInput({
  disabled = false,
  disabledReason,
  helperText,
  onSubmitGuess,
}: GuessInputProps) {
  const [guess, setGuess] = useState('');
  const helperId = helperText ? 'player-guess-helper' : undefined;
  const disabledId = disabled && disabledReason ? 'player-guess-disabled' : undefined;
  const describedBy = [helperId, disabledId].filter(Boolean).join(' ') || undefined;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (disabled) {
      return;
    }

    onSubmitGuess(guess);
    setGuess('');
  }

  return (
    <form className="guess-form" onSubmit={handleSubmit}>
      <label className="guess-form__label visually-hidden" htmlFor="player-guess">
        Guess any hidden starter
      </label>
      <div className="guess-form__row">
        <input
          id="player-guess"
          className="guess-form__input"
          name="playerGuess"
          type="text"
          autoComplete="off"
          autoCapitalize="words"
          spellCheck={false}
          enterKeyHint="go"
          placeholder="Type a player name"
          value={guess}
          disabled={disabled}
          aria-describedby={describedBy}
          onChange={(event) => setGuess(event.target.value)}
        />
        <button
          className="guess-form__button"
          type="submit"
          disabled={disabled || guess.trim().length === 0}
        >
          Submit
        </button>
      </div>
      {helperText ? (
        <p id="player-guess-helper" className="guess-form__helper">
          {helperText}
        </p>
      ) : null}
      {disabled && disabledReason ? (
        <p id="player-guess-disabled" className="guess-form__disabled-note" aria-live="polite">
          {disabledReason}
        </p>
      ) : null}
    </form>
  );
}
