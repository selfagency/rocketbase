<script lang="ts">
  import DataTable from '$lib/components/admin/pages/data-table.svelte';
  import * as m from '$lib/paraglide/messages';
  import { columns } from '$lib/server/admin/pages-columns';
  import { MetaTags } from 'svelte-meta-tags';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<MetaTags title={m['admin.pages.title']()} description={m['admin.pages.description']()} robots="noindex, nofollow" />

<div class="container mx-auto py-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold">{m['admin.pages.title']()}</h1>
    <p class="mt-2 text-muted-foreground">{m['admin.pages.description']()}</p>
  </div>

  <DataTable
    data={data.pages}
    {columns}
    currentPage={data.page}
    totalPages={data.totalPages}
    totalItems={data.totalItems}
    status={data.status}
  />
</div>
