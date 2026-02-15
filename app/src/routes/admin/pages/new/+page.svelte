<script lang="ts">
  import EditorSessionGuard from '$lib/components/admin/editor-session-guard.svelte';
  import PageForm from '$lib/components/admin/pages/page-form.svelte';
  import { MetaTags } from 'svelte-meta-tags';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  let pageFormRef = $state<any>(null);

  export const snapshot = {
    capture: () => pageFormRef?.captureFormSnapshot() ?? null,
    restore: (snapshotState: unknown) => pageFormRef?.restoreFormSnapshot(snapshotState),
  };

  const draftRecordId = 'admin-page-create';

  function restoreDraftSnapshot(event: CustomEvent<{ snapshot: unknown }>) {
    pageFormRef?.restoreFormSnapshot(event.detail.snapshot);
  }
</script>

<MetaTags title="Create Page | Admin" robots="noindex, nofollow" />

<div class="container mx-auto max-w-4xl py-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold">Create Page</h1>
    <p class="mt-2 text-muted-foreground">Add a new page to your site.</p>
  </div>

  <EditorSessionGuard
    collectionId="pages"
    recordId={draftRecordId}
    userId={data.user?.id ?? ''}
    getSnapshot={() => pageFormRef?.captureFormSnapshot?.() ?? null}
    on:restoreDraft={restoreDraftSnapshot}
  />

  <PageForm bind:this={pageFormRef} {data} isEdit={false} availableParents={data.availableParents} />
</div>
