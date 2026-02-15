<script lang="ts">
  import { env } from '$env/dynamic/public';
  import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
  import { Button } from '$lib/components/ui/button';
  import { createEventDispatcher, onMount } from 'svelte';

  type ActiveEditor = {
    id: string;
    lastSeen: string;
  };

  type SnapshotStatusResponse = {
    snapshot: unknown;
    snapshotUpdatedAt: string | null;
    activeEditors: Array<{ id: string; name: string; lastSeen: string }>;
    recordUpdatedAt: string | null;
  };

  const dispatch = createEventDispatcher<{
    restoreDraft: { snapshot: unknown };
    syncStateChanged: { syncing: boolean };
  }>();

  let {
    collectionId,
    recordId,
    recordUpdatedAt,
    userId = '',
    autosaveIntervalMs = 10_000,
    heartbeatIntervalMs = 20_000,
    getSnapshot,
  }: {
    collectionId: string;
    recordId: string;
    recordUpdatedAt?: string;
    userId?: string;
    autosaveIntervalMs?: number;
    heartbeatIntervalMs?: number;
    getSnapshot: () => unknown;
  } = $props();

  let recoverableSnapshot = $state<unknown | null>(null);
  let snapshotTimestamp = $state<string | null>(null);
  let activeEditorCount = $state(0);
  let recordChangedSinceStart = $state(false);
  let recordChangedAt = $state<string | null>(null);
  let warningMessage = $state<string | null>(null);
  let isSyncing = $state(false);

  let worker: Worker | null = null;
  let autosaveTimer: ReturnType<typeof setInterval> | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  let sessionStartedAt = '';
  let lastAutosaveHash = '';
  let initialSnapshotHash = '';
  let syncStartedAt = 0;
  let syncClearTimer: ReturnType<typeof setTimeout> | null = null;
  const MIN_SYNC_VISIBLE_MS = 900;

  function serializeSnapshot(snapshot: unknown): string {
    const seen = new WeakSet<object>();

    return JSON.stringify(snapshot, (_key, value) => {
      if (value instanceof Date) {
        return value.toISOString();
      }

      if (typeof File !== 'undefined' && value instanceof File) {
        return {
          __type: 'file',
          name: value.name,
          size: value.size,
          type: value.type,
          lastModified: value.lastModified,
        };
      }

      if (typeof Blob !== 'undefined' && value instanceof Blob) {
        return {
          __type: 'blob',
          size: value.size,
          type: value.type,
        };
      }

      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }

      return value;
    });
  }

  function hasRecoverableChanges(snapshot: unknown): boolean {
    if (snapshot == null) return false;

    const serialized = serializeSnapshot(snapshot);
    if (serialized === '{}' || serialized === '[]' || serialized === 'null') return false;

    if (!initialSnapshotHash) return true;
    return serialized !== initialSnapshotHash;
  }

  function captureInitialSnapshotBaseline() {
    try {
      const baseline = getSnapshot?.();
      initialSnapshotHash = serializeSnapshot(baseline ?? null);
      lastAutosaveHash = initialSnapshotHash;
    } catch {
      initialSnapshotHash = '';
      lastAutosaveHash = '';
    }
  }

  function formatDate(value: string | null | undefined): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }

  function readCookie(name: string): string {
    const encodedName = `${encodeURIComponent(name)}=`;
    const pairs = document.cookie ? document.cookie.split('; ') : [];

    for (const pair of pairs) {
      if (!pair.startsWith(encodedName)) continue;
      return decodeURIComponent(pair.slice(encodedName.length));
    }

    return '';
  }

  async function fetchSnapshotStatus() {
    try {
      const params = new URLSearchParams({
        collectionId,
        recordId,
      });

      const response = await fetch(`/api/admin/snapshots?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load snapshot state.');

      const payload = (await response.json()) as SnapshotStatusResponse;
      recoverableSnapshot = hasRecoverableChanges(payload.snapshot) ? (payload.snapshot ?? null) : null;
      snapshotTimestamp = payload.snapshotUpdatedAt;

      if (payload.activeEditors?.length) {
        activeEditorCount = payload.activeEditors.length;
      }

      const latestRecordUpdatedAt = payload.recordUpdatedAt || recordUpdatedAt || null;
      if (!latestRecordUpdatedAt) return;

      if (new Date(latestRecordUpdatedAt).getTime() > new Date(sessionStartedAt).getTime()) {
        recordChangedSinceStart = true;
        recordChangedAt = latestRecordUpdatedAt;
      }
    } catch (err) {
      warningMessage = err instanceof Error ? err.message : 'Unable to load draft recovery status.';
    }
  }

  async function postSnapshot(action: 'autosave' | 'heartbeat', snapshot?: unknown) {
    const response = await fetch('/api/admin/snapshots', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        collectionId,
        recordId,
        snapshot,
      }),
    });

    if (!response.ok) {
      throw new Error(`Snapshot ${action} failed.`);
    }

    const payload = (await response.json()) as { updatedAt?: string };
    if (payload.updatedAt) {
      snapshotTimestamp = payload.updatedAt;
    }
  }

  async function runAutosave() {
    try {
      if (isSyncing) return;

      const snapshot = getSnapshot?.();
      if (!snapshot) return;

      const serializedSnapshot = serializeSnapshot(snapshot);
      const nextHash = serializedSnapshot;
      if (initialSnapshotHash && nextHash === initialSnapshotHash) return;
      if (nextHash === lastAutosaveHash) return;

      setSyncingState(true);
      await postSnapshot('autosave', JSON.parse(serializedSnapshot));
      lastAutosaveHash = nextHash;
    } catch (err) {
      warningMessage = err instanceof Error ? err.message : 'Autosave failed.';
    } finally {
      setSyncingState(false);
    }
  }

  async function sendHeartbeat() {
    try {
      await postSnapshot('heartbeat');
    } catch {
      // best-effort heartbeat
    }
  }

  function restoreDraft() {
    if (!recoverableSnapshot) return;
    dispatch('restoreDraft', { snapshot: recoverableSnapshot });
  }

  function setSyncingState(next: boolean) {
    if (next) {
      if (syncClearTimer) {
        clearTimeout(syncClearTimer);
        syncClearTimer = null;
      }

      syncStartedAt = Date.now();

      if (!isSyncing) {
        isSyncing = true;
        dispatch('syncStateChanged', { syncing: true });
      }

      return;
    }

    if (!isSyncing) return;

    const elapsed = Date.now() - syncStartedAt;
    const remaining = Math.max(0, MIN_SYNC_VISIBLE_MS - elapsed);

    if (remaining === 0) {
      isSyncing = false;
      dispatch('syncStateChanged', { syncing: false });
      return;
    }

    if (syncClearTimer) {
      clearTimeout(syncClearTimer);
    }

    syncClearTimer = setTimeout(() => {
      syncClearTimer = null;
      if (!isSyncing) return;
      isSyncing = false;
      dispatch('syncStateChanged', { syncing: false });
    }, remaining);
  }

  function dismissRecoveryNotice() {
    recoverableSnapshot = null;
  }

  function initWorker() {
    try {
      worker = new Worker(new URL('../../workers/editor-activity.worker.ts', import.meta.url), {
        type: 'module',
      });

      worker.onmessage = event => {
        const message = event.data as {
          type?: string;
          activeEditorCount?: number;
          activeEditors?: ActiveEditor[];
          updatedAt?: string;
          message?: string;
        };

        if (message.type === 'connected') {
          return;
        }

        if (message.type === 'active-editors-changed') {
          activeEditorCount = typeof message.activeEditorCount === 'number' ? message.activeEditorCount : 0;
          return;
        }

        if (message.type === 'record-updated') {
          recordChangedSinceStart = true;
          recordChangedAt = message.updatedAt || new Date().toISOString();
          return;
        }

        if (message.type === 'error' && message.message) {
          warningMessage = message.message;
        }
      };

      worker.postMessage({
        type: 'start',
        payload: {
          pbUrl: env.PUBLIC_POCKETBASE_URL || '/',
          authCookie: readCookie('pb_auth'),
          collectionId,
          recordId,
          currentUserId: userId,
          sessionStartedAt,
        },
      });
    } catch {
      warningMessage = 'Realtime edit warnings are unavailable in this browser.';
    }
  }

  onMount(() => {
    sessionStartedAt = new Date().toISOString();
    captureInitialSnapshotBaseline();
    void fetchSnapshotStatus();

    autosaveTimer = setInterval(() => {
      void runAutosave();
    }, autosaveIntervalMs);

    heartbeatTimer = setInterval(() => {
      void sendHeartbeat();
    }, heartbeatIntervalMs);

    void sendHeartbeat();
    initWorker();

    return () => {
      if (autosaveTimer) clearInterval(autosaveTimer);
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      if (syncClearTimer) {
        clearTimeout(syncClearTimer);
        syncClearTimer = null;
      }
      worker?.postMessage({ type: 'stop' });
      worker?.terminate();
      worker = null;
    };
  });
</script>

<div class="space-y-3" aria-live="polite">
  {#if recoverableSnapshot}
    <Alert class="border-amber-400/60 bg-amber-50/80 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
      <AlertTitle>Recovered unsaved draft available</AlertTitle>
      <AlertDescription>
        {#if snapshotTimestamp}
          We found unsaved work from {formatDate(snapshotTimestamp)}.
        {:else}
          We found unsaved work from a previous session.
        {/if}
        <div class="mt-2 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            class="border-amber-500/60 bg-amber-100/80 text-amber-950 hover:bg-amber-200 dark:border-amber-300/40 dark:bg-amber-900/50 dark:text-amber-100"
            onclick={restoreDraft}
          >
            Restore draft
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            class="text-amber-900 hover:bg-amber-100 dark:text-amber-100 dark:hover:bg-amber-900/30"
            onclick={dismissRecoveryNotice}
          >
            Dismiss
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  {/if}

  {#if activeEditorCount > 0}
    <Alert class="border-blue-400/60 bg-blue-50/80 text-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
      <AlertTitle>Another editor is active</AlertTitle>
      <AlertDescription>
        {activeEditorCount === 1
          ? 'Someone else is actively editing this record right now.'
          : `${activeEditorCount} other editors are currently active on this record.`}
      </AlertDescription>
    </Alert>
  {/if}

  {#if recordChangedSinceStart}
    <Alert variant="destructive">
      <AlertTitle>This record changed while you were editing</AlertTitle>
      <AlertDescription>
        Another update was detected {recordChangedAt ? `at ${formatDate(recordChangedAt)}` : 'in a parallel session'}.
        Review carefully before saving to avoid overwriting someone else's changes.
      </AlertDescription>
    </Alert>
  {/if}

  {#if warningMessage}
    <p class="text-sm text-muted-foreground">{warningMessage}</p>
  {/if}
</div>
