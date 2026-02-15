<script lang="ts">
  import DataTable from '$lib/components/admin/posts/data-table.svelte';
  import { Button } from '$lib/components/ui/button';
  import { columns } from '$lib/utils/admin/posts-columns';
  import { MetaTags } from 'svelte-meta-tags';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<MetaTags title="Admin Posts" description="Manage posts in the admin dashboard" robots="noindex, nofollow" />

<div class="container mx-auto py-8">
  <div class="mb-8 flex flex-wrap items-start justify-between gap-4">
    <div>
      <h1 class="text-3xl font-bold">Posts</h1>
      <p class="mt-2 text-muted-foreground">Create, update, and manage your posts.</p>
    </div>
    <Button href="/admin/posts/new">Create Post</Button>
  </div>

  <DataTable
    data={data.posts}
    {columns}
    currentPage={data.page}
    totalPages={data.totalPages}
    totalItems={data.totalItems}
    status={data.status}
    authors={data.authors}
    selectedAuthor={data.selectedAuthor}
  />
</div>
