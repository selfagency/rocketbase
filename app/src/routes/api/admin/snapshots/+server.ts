import type { SnapshotsResponse, UsersResponse } from '$lib/types/pocketbase';
import { error, json, type RequestHandler } from '@sveltejs/kit';

type SnapshotPayload = {
  action?: 'autosave' | 'heartbeat';
  collectionId?: string;
  recordId?: string;
  snapshot?: unknown;
};

type ActiveEditor = {
  id: string;
  name: string;
  lastSeen: string;
};

const ACTIVE_WINDOW_MS = 2 * 60 * 1000;

function ensureEditorAccess(user: UsersResponse | null) {
  if (!user) error(401, 'Unauthorized');
  if (user.role !== 'admin' && user.role !== 'editor') {
    error(403, 'Forbidden - Requires editor or admin role');
  }
}

function isValidIdentifier(value: string): boolean {
  return /^[a-z][a-z0-9_]*$/i.test(value);
}

function isKnownEditableCollection(value: string): value is 'posts' | 'pages' {
  return value === 'posts' || value === 'pages';
}

function escapeFilter(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}

function buildSnapshotFilter(collectionId: string, recordId: string, editorId?: string): string {
  const base = `collection_id = "${escapeFilter(collectionId)}" && record_id = "${escapeFilter(recordId)}"`;
  if (!editorId) return base;
  return `${base} && editor = "${escapeFilter(editorId)}"`;
}

function cutoffIso(windowMs: number): string {
  return new Date(Date.now() - windowMs).toISOString().replace('T', ' ').replace('Z', '');
}

async function findOwnSnapshot(locals: App.Locals, collectionId: string, recordId: string, editorId: string) {
  try {
    return await locals.pb
      .collection('snapshots')
      .getFirstListItem<SnapshotsResponse>(buildSnapshotFilter(collectionId, recordId, editorId));
  } catch {
    return null;
  }
}

async function upsertSnapshot(
  locals: App.Locals,
  params: {
    collectionId: string;
    recordId: string;
    editorId: string;
    snapshot: unknown;
  }
): Promise<SnapshotsResponse> {
  const existing = await findOwnSnapshot(locals, params.collectionId, params.recordId, params.editorId);

  const data = {
    collection_id: params.collectionId,
    record_id: params.recordId,
    editor: params.editorId,
    snapshot: params.snapshot,
  };

  if (existing) {
    return await locals.pb.collection('snapshots').update<SnapshotsResponse>(existing.id, data);
  }

  return await locals.pb.collection('snapshots').create<SnapshotsResponse>(data);
}

async function listActiveEditors(locals: App.Locals, collectionId: string, recordId: string, currentUserId: string) {
  const filter =
    `${buildSnapshotFilter(collectionId, recordId)} && updated >= "${cutoffIso(ACTIVE_WINDOW_MS)}" ` +
    `&& editor != "${escapeFilter(currentUserId)}"`;

  const records = await locals.pb
    .collection('snapshots')
    .getFullList<SnapshotsResponse<unknown, { editor?: { id?: string; name?: string; email?: string } }>>({
      filter,
      sort: '-updated',
      expand: 'editor',
      fields: 'id,updated,editor,expand.editor.id,expand.editor.name,expand.editor.email',
    });

  const deduped = new Map<string, ActiveEditor>();

  for (const record of records) {
    const editorId =
      typeof record.editor === 'string'
        ? record.editor
        : typeof record.expand?.editor?.id === 'string'
          ? record.expand.editor.id
          : '';

    if (!editorId || deduped.has(editorId)) continue;

    const fallbackName = record.expand?.editor?.email || 'Another editor';
    deduped.set(editorId, {
      id: editorId,
      name: record.expand?.editor?.name || fallbackName,
      lastSeen: record.updated,
    });
  }

  return [...deduped.values()];
}

async function getRecordUpdatedAt(locals: App.Locals, collectionId: string, recordId: string): Promise<string | null> {
  if (!isKnownEditableCollection(collectionId)) return null;

  try {
    const record = await locals.pb.collection(collectionId).getOne<{ updated?: string }>(recordId, {
      fields: 'updated',
    });

    return typeof record.updated === 'string' ? record.updated : null;
  } catch {
    return null;
  }
}

export const GET: RequestHandler = async ({ locals, url }) => {
  ensureEditorAccess(locals.user);

  const collectionId = (url.searchParams.get('collectionId') || '').trim();
  const recordId = (url.searchParams.get('recordId') || '').trim();

  if (!collectionId || !recordId || !isValidIdentifier(collectionId)) {
    return json({ error: 'Valid collectionId and recordId are required.' }, { status: 400 });
  }

  const userId = locals.user!.id;
  const [ownSnapshot, activeEditors, recordUpdatedAt] = await Promise.all([
    findOwnSnapshot(locals, collectionId, recordId, userId),
    listActiveEditors(locals, collectionId, recordId, userId),
    getRecordUpdatedAt(locals, collectionId, recordId),
  ]);

  return json({
    snapshot: ownSnapshot?.snapshot ?? null,
    snapshotUpdatedAt: ownSnapshot?.updated ?? null,
    activeEditors,
    recordUpdatedAt,
  });
};

export const POST: RequestHandler = async ({ locals, request }) => {
  ensureEditorAccess(locals.user);

  const body = (await request.json()) as SnapshotPayload;
  const action = body.action || 'autosave';
  const collectionId = (body.collectionId || '').trim();
  const recordId = (body.recordId || '').trim();

  if (!collectionId || !recordId || !isValidIdentifier(collectionId)) {
    return json({ error: 'Valid collectionId and recordId are required.' }, { status: 400 });
  }

  const current = await findOwnSnapshot(locals, collectionId, recordId, locals.user!.id);

  const snapshotData = action === 'heartbeat' ? (current?.snapshot ?? {}) : (body.snapshot ?? {});

  const updated = await upsertSnapshot(locals, {
    collectionId,
    recordId,
    editorId: locals.user!.id,
    snapshot: snapshotData,
  });

  return json({
    success: true,
    updatedAt: updated.updated,
  });
};

export const DELETE: RequestHandler = async ({ locals, url }) => {
  ensureEditorAccess(locals.user);

  const collectionId = (url.searchParams.get('collectionId') || '').trim();
  const recordId = (url.searchParams.get('recordId') || '').trim();

  if (!collectionId || !recordId || !isValidIdentifier(collectionId)) {
    return json({ error: 'Valid collectionId and recordId are required.' }, { status: 400 });
  }

  const ownSnapshot = await findOwnSnapshot(locals, collectionId, recordId, locals.user!.id);
  if (!ownSnapshot) {
    return json({ success: true });
  }

  await locals.pb.collection('snapshots').delete(ownSnapshot.id);
  return json({ success: true });
};
