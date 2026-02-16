<script lang="ts">
  import { browser } from '$app/environment';
  import EditorSessionGuard from '$lib/components/admin/editor-session-guard.svelte';
  import PageForm from '$lib/components/admin/pages/page-form.svelte';
  import Loader2Icon from '@lucide/svelte/icons/loader-2';
  import { uid } from 'radashi';
  import { MetaTags } from 'svelte-meta-tags';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  let pageFormRef = $state<any>(null);
  let pageIsSyncing = $state(false);
  const draftInstanceUid = browser ? uid(12) : 'ssr';
  let draftRecordId = $state(`draft-page-untitled-page::${draftInstanceUid}`);

  export const snapshot = {
    capture: () => pageFormRef?.captureFormSnapshot() ?? null,
    restore: (snapshotState: unknown) => pageFormRef?.restoreFormSnapshot(snapshotState),
  };

  function restoreDraftSnapshot(event: CustomEvent<{ snapshot: unknown }>) {
    pageFormRef?.restoreFormSnapshot(event.detail.snapshot);
  }

  function updateDraftIdentity(event: CustomEvent<{ formId: string; slug: string }>) {
    const slug = event.detail.slug?.trim() || 'untitled-page';
    draftRecordId = `draft-page-${slug}::${draftInstanceUid}`;
  }

  function handleSyncStateChanged(event: CustomEvent<{ syncing: boolean }>) {
    pageIsSyncing = event.detail.syncing;
  }
</script>

<MetaTags title="Create Page | Admin" robots="noindex, nofollow" />

<div class="mx-auto w-full max-w-4xl px-4 py-8 md:py-10">
  <div class="mb-8">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-3xl font-bold">Create Page</h1>
      <span
        class="surface-enter inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-foreground"
        role="status"
        aria-live="polite"
      >
        <Loader2Icon class={`size-3.5 ${pageIsSyncing ? 'animate-spin' : ''}`} aria-hidden="true" />
        {pageIsSyncing ? 'Syncing' : 'Synced'}
      </span>
    </div>
    <p class="mt-2 text-muted-foreground">Add a new page to your site.</p>
  </div>

  <EditorSessionGuard
    collectionId="pages"
    recordId={draftRecordId}
    userId={data.user?.id ?? ''}
    getSnapshot={() => pageFormRef?.captureFormSnapshot?.() ?? null}
    on:restoreDraft={restoreDraftSnapshot}
    on:syncStateChanged={handleSyncStateChanged}
  />

  <PageForm
    bind:this={pageFormRef}
    {data}
    isEdit={false}
    availableParents={data.availableParents}
    on:draftIdentityChanged={updateDraftIdentity}
  />
</div>
