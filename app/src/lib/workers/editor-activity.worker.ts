import PocketBase from 'pocketbase';

type StartPayload = {
  pbUrl: string;
  authCookie?: string;
  collectionId: string;
  recordId: string;
  currentUserId?: string;
  sessionStartedAt: string;
};

type WorkerInbound = { type: 'start'; payload: StartPayload } | { type: 'stop' };

type ActiveEditor = {
  id: string;
  lastSeen: string;
};

let pb: PocketBase | null = null;
let activeCollectionId = '';
let activeRecordId = '';
let currentUserId = '';
let sessionStartedAtMs = 0;
let pruneTimer: ReturnType<typeof setInterval> | null = null;
const activeEditors = new Map<string, ActiveEditor>();

const ACTIVE_WINDOW_MS = 2 * 60 * 1000;

function post(type: string, payload: Record<string, unknown> = {}) {
  self.postMessage({ type, ...payload });
}

async function cleanup() {
  if (pruneTimer) {
    clearInterval(pruneTimer);
    pruneTimer = null;
  }

  activeEditors.clear();

  if (!pb || !activeCollectionId || !activeRecordId) {
    pb = null;
    activeCollectionId = '';
    activeRecordId = '';
    return;
  }

  try {
    await pb.collection('snapshots').unsubscribe('*');
    await pb.collection(activeCollectionId).unsubscribe(activeRecordId);
  } catch {
    // noop
  }

  pb = null;
  activeCollectionId = '';
  activeRecordId = '';
  currentUserId = '';
  sessionStartedAtMs = 0;
}

function emitActiveEditors() {
  const now = Date.now();
  const filtered = [...activeEditors.values()].filter(
    editor => now - new Date(editor.lastSeen).getTime() <= ACTIVE_WINDOW_MS
  );

  post('active-editors-changed', {
    activeEditorCount: filtered.length,
    activeEditors: filtered,
  });
}

function handleSnapshotMessage(event: { action: string; record?: Record<string, unknown> }) {
  const record = event.record || {};

  const collectionId = typeof record.collection_id === 'string' ? record.collection_id : '';
  const recordId = typeof record.record_id === 'string' ? record.record_id : '';

  if (collectionId !== activeCollectionId || recordId !== activeRecordId) return;

  const editorId = typeof record.editor === 'string' ? record.editor : '';
  if (!editorId || editorId === currentUserId) return;

  const updated = typeof record.updated === 'string' ? record.updated : new Date().toISOString();
  activeEditors.set(editorId, { id: editorId, lastSeen: updated });

  emitActiveEditors();
}

function handleRecordUpdateMessage(event: { action: string; record?: Record<string, unknown> }) {
  if (event.action !== 'update') return;
  const record = event.record || {};
  const updated = typeof record.updated === 'string' ? record.updated : '';
  if (!updated) return;

  const updatedAt = new Date(updated).getTime();
  if (!Number.isFinite(updatedAt)) return;

  if (updatedAt > sessionStartedAtMs) {
    post('record-updated', { updatedAt: updated });
  }
}

async function start(payload: StartPayload) {
  await cleanup();

  pb = new PocketBase(payload.pbUrl || '/');
  pb.autoCancellation(false);

  if (payload.authCookie) {
    pb.authStore.loadFromCookie(payload.authCookie);
  }

  activeCollectionId = payload.collectionId;
  activeRecordId = payload.recordId;
  currentUserId = payload.currentUserId || '';
  sessionStartedAtMs = new Date(payload.sessionStartedAt).getTime();

  if (!Number.isFinite(sessionStartedAtMs)) {
    sessionStartedAtMs = Date.now();
  }

  try {
    await pb.collection('snapshots').subscribe(
      '*',
      event => {
        handleSnapshotMessage(event as { action: string; record?: Record<string, unknown> });
      },
      {
        filter: pb.filter('collection_id = {:collectionId} && record_id = {:recordId}', {
          collectionId: activeCollectionId,
          recordId: activeRecordId,
        }),
      }
    );

    await pb.collection(activeCollectionId).subscribe(activeRecordId, event => {
      handleRecordUpdateMessage(event as { action: string; record?: Record<string, unknown> });
    });

    pruneTimer = setInterval(() => {
      emitActiveEditors();
    }, 15000);

    post('connected');
  } catch (err) {
    post('error', {
      message: err instanceof Error ? err.message : 'Failed to initialize realtime watcher.',
    });
  }
}

self.onmessage = async event => {
  const message = event.data as WorkerInbound;

  if (message.type === 'start') {
    await start(message.payload);
    return;
  }

  if (message.type === 'stop') {
    await cleanup();
  }
};
