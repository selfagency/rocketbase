<script lang="ts">
  import { browser } from '$app/environment';
  import EditorSessionGuard from '$lib/components/admin/editor-session-guard.svelte';
  import PostForm from '$lib/components/admin/posts/post-form.svelte';
  import Loader2Icon from '@lucide/svelte/icons/loader-2';
  import { uid } from 'radashi';
  import { MetaTags } from 'svelte-meta-tags';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  let postFormRef = $state<any>(null);
  let postIsSyncing = $state(false);
  const draftInstanceUid = browser ? uid(12) : 'ssr';
  let draftRecordId = $state(`draft-post-untitled-post::${draftInstanceUid}`);

  export const snapshot = {
    capture: () => postFormRef?.captureFormSnapshot() ?? null,
    restore: (snapshotState: unknown) => postFormRef?.restoreFormSnapshot(snapshotState),
  };

  function restoreDraftSnapshot(event: CustomEvent<{ snapshot: unknown }>) {
    postFormRef?.restoreFormSnapshot(event.detail.snapshot);
  }

  function updateDraftIdentity(event: CustomEvent<{ formId: string; slug: string }>) {
    const slug = event.detail.slug?.trim() || 'untitled-post';
    draftRecordId = `draft-post-${slug}::${draftInstanceUid}`;
  }

  function handleSyncStateChanged(event: CustomEvent<{ syncing: boolean }>) {
    postIsSyncing = event.detail.syncing;
  }
</script>

<MetaTags title="Create Post | Admin" robots="noindex, nofollow" />

<div class="mx-auto w-full max-w-4xl px-4 py-8 md:py-10">
  <div class="mb-8">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-3xl font-bold">Create Post</h1>
      <span
        class="surface-enter inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-foreground"
        role="status"
        aria-live="polite"
      >
        <Loader2Icon class={`size-3.5 ${postIsSyncing ? 'animate-spin' : ''}`} aria-hidden="true" />
        {postIsSyncing ? 'Syncing' : 'Synced'}
      </span>
    </div>
    <p class="mt-2 text-muted-foreground">Add a new post to your site.</p>
  </div>

  <EditorSessionGuard
    collectionId="posts"
    recordId={draftRecordId}
    userId={data.user?.id ?? ''}
    getSnapshot={() => postFormRef?.captureFormSnapshot?.() ?? null}
    on:restoreDraft={restoreDraftSnapshot}
    on:syncStateChanged={handleSyncStateChanged}
  />

  <PostForm bind:this={postFormRef} {data} isEdit={false} on:draftIdentityChanged={updateDraftIdentity} />
</div>
