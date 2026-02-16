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

  function restoreDraftSnapshot(event: CustomEvent<{ snapshot: unknown }>) {
    pageFormRef?.restoreFormSnapshot(event.detail.snapshot);
  }
</script>

<MetaTags title={`Edit Page: ${data.page.title} | Admin`} robots="noindex, nofollow" />

<div class="mx-auto w-full max-w-4xl px-4 py-8 md:py-10">
  <div class="mb-8">
    <h1 class="text-3xl font-bold">Edit Page</h1>
    <p class="mt-2 text-muted-foreground">Update "{data.page.title || 'Untitled'}"</p>
  </div>

  <EditorSessionGuard
    collectionId="pages"
    recordId={data.page.id}
    recordUpdatedAt={data.page.updated}
    userId={data.user?.id ?? ''}
    getSnapshot={() => pageFormRef?.captureFormSnapshot?.() ?? null}
    on:restoreDraft={restoreDraftSnapshot}
  />

  <PageForm
    bind:this={pageFormRef}
    {data}
    isEdit={true}
    parentSlug={data.parentSlug}
    pageId={data.page.id}
    availableParents={data.availableParents}
  />
</div>
