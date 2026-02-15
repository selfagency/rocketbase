import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatRelativeTime } from '../../../lib/utils/relative-time';

describe('formatRelativeTime', () => {
  const now = new Date('2026-02-15T08:00:00.000Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns dash for nullish values', () => {
    expect(formatRelativeTime(null)).toBe('-');
    expect(formatRelativeTime(undefined)).toBe('-');
  });

  it('returns dash for invalid date values', () => {
    expect(formatRelativeTime('not-a-date')).toBe('-');
  });

  it('formats a few seconds ago', () => {
    expect(formatRelativeTime(new Date(now.getTime() - 10_000))).toBe('a few seconds ago');
  });

  it('formats minutes (singular/plural)', () => {
    expect(formatRelativeTime(new Date(now.getTime() - 60_000))).toBe('1 minute ago');
    expect(formatRelativeTime(new Date(now.getTime() - 5 * 60_000))).toBe('5 minutes ago');
  });

  it('formats hours', () => {
    expect(formatRelativeTime(new Date(now.getTime() - 3 * 60 * 60_000))).toBe('3 hours ago');
  });

  it('formats days', () => {
    expect(formatRelativeTime(new Date(now.getTime() - 2 * 24 * 60 * 60_000))).toBe('2 days ago');
  });

  it('formats months', () => {
    expect(formatRelativeTime(new Date(now.getTime() - 45 * 24 * 60 * 60_000))).toBe('1 month ago');
  });

  it('formats years', () => {
    expect(formatRelativeTime(new Date(now.getTime() - 370 * 24 * 60 * 60_000))).toBe('1 year ago');
  });

  it('formats future values', () => {
    expect(formatRelativeTime(new Date(now.getTime() + 20_000))).toBe('in a few seconds');
    expect(formatRelativeTime(new Date(now.getTime() + 10 * 60_000))).toBe('in 10 minutes');
  });
});
