import { FormEvent, useState } from 'react';

interface GuessInputProps {
  disabled?: boolean;
  helperText?: string;
  onSubmitGuess: (guess: string) => void;
}

export function GuessInput({
  disabled = false,
  helperText,
  onSubmitGuess,
}: GuessInputProps) {
  const [guess, setGuess] = useState('');

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
      <label className="guess-form__label" htmlFor="player-guess">
        Guess any hidden starter
      </label>
      {helperText ? <p className="guess-form__helper">{helperText}</p> : null}
      <div className="guess-form__row">
        <input
          id="player-guess"
          className="guess-form__input"
          name="playerGuess"
          type="text"
          autoComplete="off"
          placeholder="Type a player name"
          value={guess}
          disabled={disabled}
          onChange={(event) => setGuess(event.target.value)}
        />
        <button className="guess-form__button" type="submit" disabled={disabled}>
          Submit
        </button>
      </div>
    </form>
  );
}
