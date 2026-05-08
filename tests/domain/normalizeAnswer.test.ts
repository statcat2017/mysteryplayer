import { describe, expect, it } from 'vitest';
import { normalizeAnswer } from '../../src/domain/normalizeAnswer';

describe('normalizeAnswer', () => {
  it('removes accents, punctuation, and duplicate whitespace', () => {
    expect(normalizeAnswer('  Nicolás   Otamendi!! ')).toBe('nicolas otamendi');
  });

  it('keeps letter and number tokens for deterministic alias matching', () => {
    expect(normalizeAnswer('E. Martínez')).toBe('e martinez');
  });
});
