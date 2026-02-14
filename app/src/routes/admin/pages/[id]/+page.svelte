<script lang="ts">
  import PageForm from '$lib/components/admin/pages/page-form.svelte';
  import { MetaTags } from 'svelte-meta-tags';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<MetaTags title={`Edit Page: ${data.page.title} | Admin`} robots="noindex, nofollow" />

<div class="container mx-auto max-w-4xl py-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold">Edit Page</h1>
    <p class="mt-2 text-muted-foreground">Update "{data.page.title || 'Untitled'}"</p>
  </div>

  <PageForm {data} isEdit={true} parentSlug={data.parentSlug} pageId={data.page.id} />
</div>
