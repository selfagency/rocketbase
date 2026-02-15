import { describe, expect, it } from 'vitest';
import { generateSlug } from '../../../lib/utils/slug-utils';

describe('generateSlug', () => {
  it('generates a hyphenated lowercase slug for normal titles', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
  });

  it('normalizes accents and strips special characters', () => {
    expect(generateSlug('Café Résumé!!!')).toBe('cafe-resume');
  });

  it('keeps original words when all words are stopwords', () => {
    expect(generateSlug('the and of')).toBe('the-and-of');
  });

  it('returns empty string for empty input', () => {
    expect(generateSlug('')).toBe('');
  });

  it('handles mixed case and punctuation', () => {
    expect(generateSlug('  My, NEW --- Post: 2026  ')).toBe('new-post-2026');
  });

  it('collapses repeated hyphens in input', () => {
    expect(generateSlug('alpha----beta ----- gamma')).toBe('alpha-beta-gamma');
  });
});
