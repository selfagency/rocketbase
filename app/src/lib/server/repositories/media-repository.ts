type EntityType = 'post' | 'page';

type PocketBaseLike = {
  collection: (name: string) => {
    getOne: (id: string, options?: Record<string, unknown>) => Promise<any>;
    getList: (page: number, perPage: number, options?: Record<string, unknown>) => Promise<any>;
  };
  files: {
    getURL: (record: any, fileName: string) => string;
  };
};

export type MediaItem = {
  id: string;
  url: string;
  altText: string;
  caption: string;
  source: string;
  sourceUrl: string;
  created: string;
  updated: string;
  attribution?: {
    photographer?: string;
    photographerUrl?: string;
    photoUrl?: string;
    provider?: string;
  };
};

function safeJsonParse<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string') return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function mapMediaItem(pb: PocketBaseLike, record: any): MediaItem {
  const metadata = safeJsonParse<Record<string, string | undefined>>(record.metadata, {});

  return {
    id: record.id,
    url: pb.files.getURL(record, record.file),
    altText: record.alt_text || '',
    caption: record.caption || '',
    source: record.source || 'upload',
    sourceUrl: record.source_url || '',
    created: record.created,
    updated: record.updated,
    attribution:
      metadata.photographer || metadata.photoUrl
        ? {
            photographer: metadata.photographer,
            photographerUrl: metadata.photographerUrl,
            photoUrl: metadata.photoUrl,
            provider: metadata.provider,
          }
        : undefined,
  };
}

export function parseAttachmentIds(raw: string | null): string[] {
  if (!raw) return [];

  return raw
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);
}

export function escapeFilterValue(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}

export function buildMediaSearchFilter(query: string): string {
  if (!query) return '';
  const escaped = escapeFilterValue(query);
  return `alt_text~"${escaped}" || caption~"${escaped}" || source~"${escaped}" || source_url~"${escaped}"`;
}

export async function resolveAttachedIds(
  pb: PocketBaseLike,
  entityType: EntityType | null,
  entityId: string | null,
  postedIds: string[]
): Promise<string[]> {
  const ids = [...postedIds];

  if (!entityType || !entityId) {
    return [...new Set(ids)];
  }

  const collectionName = entityType === 'post' ? 'posts' : 'pages';
  const record = await pb.collection(collectionName).getOne(entityId, { fields: 'attachments' });
  const existing = Array.isArray(record.attachments) ? record.attachments : [];

  for (const id of existing) {
    if (id) ids.push(id);
  }

  return [...new Set(ids)];
}

export async function listAttachedMedia(pb: PocketBaseLike, ids: string[]): Promise<MediaItem[]> {
  if (ids.length === 0) return [];

  const records = await Promise.all(
    ids.map(async id => {
      try {
        return await pb.collection('media').getOne(id);
      } catch {
        return null;
      }
    })
  );

  return records.filter(Boolean).map(record => mapMediaItem(pb, record));
}
