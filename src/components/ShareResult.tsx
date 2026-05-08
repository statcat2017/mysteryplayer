import { useState } from 'react';

interface ShareResultProps {
  summary: string;
}

export function ShareResult({ summary }: ShareResultProps) {
  const [copyLabel, setCopyLabel] = useState('Copy result');

  async function handleCopy() {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      setCopyLabel('Copy unavailable');
      return;
    }

    await navigator.clipboard.writeText(summary);
    setCopyLabel('Copied');
  }

  return (
    <section className="share-card" aria-labelledby="share-result">
      <div className="share-card__header">
        <div>
          <p className="share-card__eyebrow">Post-game share</p>
          <h2 id="share-result">Spoiler-safe result</h2>
        </div>
        <button className="share-card__button" type="button" onClick={handleCopy}>
          {copyLabel}
        </button>
      </div>

      <p className="share-card__legend">O = solved clean, H = solved with hints, X = unsolved.</p>

      <textarea
        className="share-card__output"
        aria-label="Spoiler-safe share result"
        readOnly
        value={summary}
      />
    </section>
  );
}
