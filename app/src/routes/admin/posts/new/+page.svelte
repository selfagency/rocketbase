<script lang="ts">
  import PostForm from '$lib/components/admin/posts/post-form.svelte';
  import { MetaTags } from 'svelte-meta-tags';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<MetaTags title="Create Post | Admin" robots="noindex, nofollow" />

<div class="container mx-auto max-w-4xl py-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold">Create Post</h1>
    <p class="mt-2 text-muted-foreground">Add a new post to your site.</p>
  </div>

  <PostForm {data} isEdit={false} />
</div>
