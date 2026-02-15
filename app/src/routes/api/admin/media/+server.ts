import { env } from '$env/dynamic/private';
import { error, json, type RequestHandler } from '@sveltejs/kit';

type ScopeType = 'attached' | 'all';
type EntityType = 'post' | 'page';

type MediaItem = {
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

function ensureEditorAccess(user: App.Locals['user']) {
  if (!user) {
    error(401, 'Unauthorized');
  }

  if (user.role !== 'admin' && user.role !== 'editor') {
    error(403, 'Forbidden - Requires editor or admin role');
  }
}

function parseAttachmentIds(raw: string | null): string[] {
  if (!raw) return [];

  return raw
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);
}

function escapeFilterValue(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}

function safeJsonParse<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string') return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function mapMediaItem(pb: App.Locals['pb'], record: any): MediaItem {
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

function isAllowedPexelsHost(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  return host === 'pexels.com' || host.endsWith('.pexels.com');
}

async function resolveAttachedIds(
  locals: App.Locals,
  entityType: EntityType | null,
  entityId: string | null,
  postedIds: string[]
): Promise<string[]> {
  const ids = [...postedIds];

  if (!entityType || !entityId) {
    return [...new Set(ids)];
  }

  const collectionName = entityType === 'post' ? 'posts' : 'pages';
  const record = await locals.pb.collection(collectionName).getOne(entityId, { fields: 'attachments' });
  const existing = Array.isArray(record.attachments) ? record.attachments : [];

  for (const id of existing) {
    if (id) ids.push(id);
  }

  return [...new Set(ids)];
}

async function listAttachedMedia(locals: App.Locals, ids: string[]): Promise<MediaItem[]> {
  if (ids.length === 0) return [];

  const records = await Promise.all(
    ids.map(async id => {
      try {
        return await locals.pb.collection('media').getOne(id);
      } catch {
        return null;
      }
    })
  );

  return records.filter(Boolean).map(record => mapMediaItem(locals.pb, record));
}

async function searchPexels(request: Request): Promise<Response> {
  const apiKey = env.PEXELS_API_KEY;
  if (!apiKey) {
    return json({ photos: [], disabled: true });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const page = Number.parseInt(searchParams.get('page') || '1', 10);
  const perPage = Math.min(Math.max(Number.parseInt(searchParams.get('perPage') || '18', 10), 1), 40);

  const isCurated = !q;
  const url = new URL(isCurated ? 'https://api.pexels.com/v1/curated' : 'https://api.pexels.com/v1/search');
  if (!isCurated) {
    url.searchParams.set('query', q);
  }
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', String(perPage));

  const response = await fetch(url, {
    headers: {
      Authorization: apiKey,
    },
  });

  if (!response.ok) {
    return json(
      {
        error: 'Pexels search failed.',
        status: response.status,
      },
      { status: 502 }
    );
  }

  const payload = (await response.json()) as {
    photos?: Array<{
      id: number;
      width: number;
      height: number;
      alt?: string;
      url: string;
      photographer: string;
      photographer_url: string;
      src: Record<string, string>;
    }>;
    page?: number;
    per_page?: number;
    total_results?: number;
  };

  const photos = (payload.photos ?? []).map(photo => ({
    id: photo.id,
    alt: photo.alt || '',
    width: photo.width,
    height: photo.height,
    src: {
      tiny: photo.src.tiny,
      medium: photo.src.medium,
      large: photo.src.large,
      original: photo.src.original,
    },
    photoUrl: photo.url,
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
  }));

  return json({
    photos,
    curated: isCurated,
    page: payload.page ?? page,
    perPage: payload.per_page ?? perPage,
    totalResults: payload.total_results ?? photos.length,
  });
}

export const GET: RequestHandler = async ({ locals, request }) => {
  ensureEditorAccess(locals.user);

  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider');

  if (provider === 'pexels') {
    return searchPexels(request);
  }

  const scope = (searchParams.get('scope') || 'all') as ScopeType;
  const query = (searchParams.get('q') || '').trim();
  const page = Math.max(Number.parseInt(searchParams.get('page') || '1', 10), 1);
  const perPage = Math.min(Math.max(Number.parseInt(searchParams.get('perPage') || '24', 10), 1), 100);

  if (scope === 'attached') {
    const entityType = searchParams.get('entityType') as EntityType | null;
    const entityId = searchParams.get('entityId');
    const postedIds = parseAttachmentIds(searchParams.get('attachmentIds'));
    const ids = await resolveAttachedIds(locals, entityType, entityId, postedIds);
    const items = await listAttachedMedia(locals, ids);
    return json({ items });
  }

  const escaped = escapeFilterValue(query);
  const filter = query
    ? `alt_text~"${escaped}" || caption~"${escaped}" || source~"${escaped}" || source_url~"${escaped}"`
    : '';

  const list = await locals.pb.collection('media').getList(page, perPage, {
    sort: '-created',
    filter,
  });

  return json({
    page: list.page,
    perPage: list.perPage,
    totalItems: list.totalItems,
    totalPages: list.totalPages,
    items: list.items.map(record => mapMediaItem(locals.pb, record)),
  });
};

export const POST: RequestHandler = async ({ locals, request }) => {
  ensureEditorAccess(locals.user);

  const formData = await request.formData();
  const action = String(formData.get('action') || 'upload');

  if (action === 'import-pexels') {
    const sourceUrl = String(formData.get('sourceUrl') || '');
    const photoUrl = String(formData.get('photoUrl') || '');
    const photographer = String(formData.get('photographer') || '');
    const photographerUrl = String(formData.get('photographerUrl') || '');
    const altText = String(formData.get('altText') || '').trim();

    if (!sourceUrl || !photoUrl) {
      return json({ error: 'Missing required Pexels import fields.' }, { status: 400 });
    }

    let parsedSource: URL;
    try {
      parsedSource = new URL(sourceUrl);
    } catch {
      return json({ error: 'Invalid source URL.' }, { status: 400 });
    }

    if (!isAllowedPexelsHost(parsedSource)) {
      return json({ error: 'Only Pexels image hosts are allowed.' }, { status: 400 });
    }

    const imageResponse = await fetch(parsedSource);
    if (!imageResponse.ok) {
      return json({ error: 'Unable to download image from Pexels.' }, { status: 502 });
    }

    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const extension = mimeType.split('/')[1]?.split(';')[0] || 'jpg';
    const imageBytes = await imageResponse.arrayBuffer();
    const imageFile = new File([imageBytes], `pexels-${Date.now()}.${extension}`, { type: mimeType });

    const createFormData = new FormData();
    createFormData.append('file', imageFile);
    createFormData.append('source', 'pexels');
    createFormData.append('source_url', photoUrl);
    createFormData.append('alt_text', altText || `Photo by ${photographer} on Pexels`);
    createFormData.append(
      'metadata',
      JSON.stringify({
        provider: 'Pexels',
        photographer,
        photographerUrl,
        photoUrl,
      })
    );

    if (locals.user?.id) {
      createFormData.append('uploaded_by', locals.user.id);
    }

    const record = await locals.pb.collection('media').create(createFormData);
    return json({ media: mapMediaItem(locals.pb, record) });
  }

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return json({ error: 'Please provide a valid media file.' }, { status: 400 });
  }

  const createFormData = new FormData();
  createFormData.append('file', file);

  const altText = String(formData.get('altText') || '').trim();
  const caption = String(formData.get('caption') || '').trim();
  if (altText) createFormData.append('alt_text', altText);
  if (caption) createFormData.append('caption', caption);

  if (locals.user?.id) {
    createFormData.append('uploaded_by', locals.user.id);
  }

  const record = await locals.pb.collection('media').create(createFormData);
  return json({ media: mapMediaItem(locals.pb, record) });
};

export const PATCH: RequestHandler = async ({ locals, request }) => {
  ensureEditorAccess(locals.user);

  const body = (await request.json()) as {
    id?: string;
    altText?: string;
    caption?: string;
  };

  if (!body.id) {
    return json({ error: 'Media id is required.' }, { status: 400 });
  }

  const record = await locals.pb.collection('media').update(body.id, {
    alt_text: body.altText || '',
    caption: body.caption || '',
  });

  return json({ media: mapMediaItem(locals.pb, record) });
};

export const DELETE: RequestHandler = async ({ locals, request }) => {
  ensureEditorAccess(locals.user);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return json({ error: 'Media id is required.' }, { status: 400 });
  }

  await locals.pb.collection('media').delete(id);
  return json({ success: true });
};
