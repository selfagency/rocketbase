import { describe, expect, it } from 'vitest';

import {
  formatRevisionTimestamp,
  getCharDiffCounts,
  getDiffItems,
  getRevisionDiffCounts,
  getVisibleRevisions,
  isSystemAuthor,
  type DiffField,
} from '../../../../lib/utils/admin/revision-diff-utils';
import type { RevisionHistoryEntry } from '../../../../lib/types/revision-history';

const diffFields: DiffField[] = [
  { key: 'title', label: 'Title' },
  { key: 'content', label: 'Content' },
];

function makeRevision(overrides: Partial<RevisionHistoryEntry>): RevisionHistoryEntry {
  return {
    id: 'rev-1',
    eventType: 'update',
    timestamp: '2026-02-15T10:00:00.000Z',
    created: '2026-02-15T10:00:00.000Z',
    authorId: 'u1',
    authorName: 'Editor',
    authorEmail: 'editor@example.com',
    before: { title: 'Old title', content: 'Old content' },
    after: { title: 'New title', content: 'Old content' },
    ...overrides,
  };
}

describe('revision-diff-utils', () => {
  it('returns fallback value for invalid timestamp', () => {
    expect(formatRevisionTimestamp('not-a-date')).toBe('not-a-date');
  });

  it('identifies system author names case-insensitively', () => {
    expect(isSystemAuthor(makeRevision({ authorName: ' System ' }))).toBe(true);
    expect(isSystemAuthor(makeRevision({ authorName: 'Alice' }))).toBe(false);
  });

  it('computes character-level add/remove counts', () => {
    expect(getCharDiffCounts('abc', 'adc')).toEqual({
      added: 1,
      removed: 1,
    });

    expect(getCharDiffCounts('', 'hello')).toEqual({
      added: 5,
      removed: 0,
    });
  });

  it('returns only changed diff items for configured fields', () => {
    const revision = makeRevision({
      before: { title: 'Old title', content: 'Old content' },
      after: { title: 'New title', content: 'Old content' },
    });

    const diffItems = getDiffItems(revision, diffFields);

    expect(diffItems).toHaveLength(1);
    expect(diffItems[0]).toMatchObject({
      key: 'title',
      label: 'Title',
      originalText: 'Old title',
      modifiedText: 'New title',
    });
  });

  it('builds diff map and filters system no-op revisions from visible list', () => {
    const humanRevision = makeRevision({ id: 'rev-human' });
    const systemNoChange = makeRevision({
      id: 'rev-system',
      authorName: 'system',
      before: { title: 'Same', content: 'Same' },
      after: { title: 'Same', content: 'Same' },
    });

    const revisions = [humanRevision, systemNoChange];
    const counts = getRevisionDiffCounts(revisions, diffFields);
    const visible = getVisibleRevisions(revisions, counts);

    expect(counts.get('rev-human')).toBeTruthy();
    expect(counts.get('rev-system')).toEqual({ added: 0, removed: 0 });
    expect(visible.map(revision => revision.id)).toEqual(['rev-human']);
  });
});
