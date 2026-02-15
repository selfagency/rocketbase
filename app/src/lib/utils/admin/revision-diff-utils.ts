import type { RevisionHistoryEntry } from '$lib/types/revision-history';

export type DiffField = {
  key: string;
  label: string;
};

export type DiffItem = {
  key: string;
  label: string;
  originalText: string;
  modifiedText: string;
};

export type CharCounts = {
  added: number;
  removed: number;
};

export function formatRevisionTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(date);
}

export function getVisibleRevisions(
  revisions: RevisionHistoryEntry[],
  revisionDiffCounts: Map<string, CharCounts>
): RevisionHistoryEntry[] {
  return revisions.filter(revision => {
    const counts = revisionDiffCounts.get(revision.id) ?? { added: 0, removed: 0 };
    const isNoChange = counts.added === 0 && counts.removed === 0;
    return !(isSystemAuthor(revision) && isNoChange);
  });
}

export function getRevisionDiffCounts(
  revisions: RevisionHistoryEntry[],
  diffFields: DiffField[]
): Map<string, CharCounts> {
  return new Map(
    revisions.map(revision => {
      const counts = getRevisionCharCounts(revision, diffFields);
      return [revision.id, counts] as const;
    })
  );
}

export function getDiffItems(revision: RevisionHistoryEntry, diffFields: DiffField[]): DiffItem[] {
  return diffFields
    .map(field => {
      const originalText = toDiffText(revision.before?.[field.key]);
      const modifiedText = toDiffText(revision.after?.[field.key]);

      return {
        key: field.key,
        label: field.label,
        originalText,
        modifiedText,
      };
    })
    .filter(diff => diff.originalText !== diff.modifiedText);
}

export function getRevisionCharCounts(revision: RevisionHistoryEntry, diffFields: DiffField[]): CharCounts {
  const diffItems = getDiffItems(revision, diffFields);
  let added = 0;
  let removed = 0;

  for (const item of diffItems) {
    const { added: addedCount, removed: removedCount } = getCharDiffCounts(item.originalText, item.modifiedText);
    added += addedCount;
    removed += removedCount;
  }

  return { added, removed };
}

export function getCharDiffCounts(original: string, modified: string): CharCounts {
  if (original === modified) return { added: 0, removed: 0 };

  const n = original.length;
  const m = modified.length;

  if (n === 0) return { added: m, removed: 0 };
  if (m === 0) return { added: 0, removed: n };

  const previous = new Uint16Array(m + 1);
  const current = new Uint16Array(m + 1);

  for (let i = 1; i <= n; i += 1) {
    for (let j = 1; j <= m; j += 1) {
      if (original.charCodeAt(i - 1) === modified.charCodeAt(j - 1)) {
        current[j] = previous[j - 1] + 1;
      } else {
        current[j] = current[j - 1] > previous[j] ? current[j - 1] : previous[j];
      }
    }

    previous.set(current);
    current.fill(0);
  }

  const lcsLength = previous[m];
  return {
    added: m - lcsLength,
    removed: n - lcsLength,
  };
}

export function isSystemAuthor(revision: RevisionHistoryEntry): boolean {
  const name = revision.authorName?.trim().toLowerCase() ?? '';
  return name === 'system';
}

function toDiffText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '';
  }
}
