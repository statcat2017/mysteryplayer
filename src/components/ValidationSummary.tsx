import { PuzzleValidationResult } from '../domain/validatePuzzle';

interface ValidationSummaryProps {
  validation: PuzzleValidationResult;
}

export function ValidationSummary({ validation }: ValidationSummaryProps) {
  const tone = validation.valid ? 'is-valid' : 'is-invalid';

  return (
    <section className={`validation-summary ${tone}`} aria-live="polite">
      <div className="validation-summary__header">
        <div>
          <p className="validation-summary__eyebrow">Runtime data validation</p>
          <h2>{validation.valid ? 'Puzzle contract passed' : 'Puzzle contract failed'}</h2>
        </div>
        <p className="validation-summary__counts">
          {validation.errors.length} errors · {validation.warnings.length} warnings
        </p>
      </div>
      {validation.errors.length > 0 ? (
        <ul className="validation-summary__list">
          {validation.errors.map((issue) => (
            <li key={`error-${issue.path}-${issue.message}`}>
              <code>{issue.path}</code>: {issue.message}
            </li>
          ))}
        </ul>
      ) : null}
      {validation.warnings.length > 0 ? (
        <ul className="validation-summary__list">
          {validation.warnings.map((issue) => (
            <li key={`warning-${issue.path}-${issue.message}`}>
              <code>{issue.path}</code>: {issue.message}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
