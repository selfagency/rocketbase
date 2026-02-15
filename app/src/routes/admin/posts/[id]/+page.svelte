<script lang="ts">
  import EditorSessionGuard from '$lib/components/admin/editor-session-guard.svelte';
  import PostForm from '$lib/components/admin/posts/post-form.svelte';
  import { MetaTags } from 'svelte-meta-tags';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  let postFormRef = $state<any>(null);

  export const snapshot = {
    capture: () => postFormRef?.captureFormSnapshot() ?? null,
    restore: (snapshotState: unknown) => postFormRef?.restoreFormSnapshot(snapshotState),
  };

  function restoreDraftSnapshot(event: CustomEvent<{ snapshot: unknown }>) {
    postFormRef?.restoreFormSnapshot(event.detail.snapshot);
  }
</script>

<MetaTags title={`Edit Post: ${data.post.title} | Admin`} robots="noindex, nofollow" />

<div class="container mx-auto max-w-4xl py-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold">Edit Post</h1>
    <p class="mt-2 text-muted-foreground">Update "{data.post.title || 'Untitled'}"</p>
  </div>

  <EditorSessionGuard
    collectionId="posts"
    recordId={data.post.id}
    recordUpdatedAt={data.post.updated}
    userId={data.user?.id ?? ''}
    getSnapshot={() => postFormRef?.captureFormSnapshot?.() ?? null}
    on:restoreDraft={restoreDraftSnapshot}
  />

  <PostForm bind:this={postFormRef} {data} isEdit={true} postId={data.post.id} />
</div>
