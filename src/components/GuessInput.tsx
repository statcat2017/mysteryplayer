import { FormEvent, useState } from 'react';

interface GuessInputProps {
  disabled?: boolean;
  onSubmitGuess: (guess: string) => void;
}

export function GuessInput({ disabled = false, onSubmitGuess }: GuessInputProps) {
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
        Global player guess
      </label>
      <div className="guess-form__row">
        <input
          id="player-guess"
          className="guess-form__input"
          name="playerGuess"
          type="text"
          autoComplete="off"
          placeholder="Type any starter's name"
          value={guess}
          disabled={disabled}
          onChange={(event) => setGuess(event.target.value)}
        />
        <button className="guess-form__button" type="submit" disabled={disabled}>
          Reveal
        </button>
      </div>
    </form>
  );
}
