<script lang="ts">
  import DataTable from '$lib/components/admin/portfolio/data-table.svelte';
  import { Button } from '$lib/components/ui/button';
  import { columns } from '$lib/utils/admin/portfolio-columns';
  import { MetaTags } from 'svelte-meta-tags';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<MetaTags
  title="Admin Portfolio"
  description="Manage portfolio items in the admin dashboard"
  robots="noindex, nofollow"
/>

<div class="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
  <div class="mb-8 flex flex-wrap items-start justify-between gap-4">
    <div>
      <h1 class="text-3xl font-bold">Portfolio</h1>
      <p class="mt-2 text-muted-foreground">Create, update, and manage your portfolio items.</p>
    </div>
    <Button href="/admin/portfolio/new">Create Portfolio Item</Button>
  </div>

  <DataTable
    data={data.items}
    {columns}
    currentPage={data.page}
    totalPages={data.totalPages}
    totalItems={data.totalItems}
    status={data.status}
  />
</div>
