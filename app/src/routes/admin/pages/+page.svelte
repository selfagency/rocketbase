<script lang="ts">
  import DataTable from '$lib/components/admin/pages/data-table.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as m from '$lib/paraglide/messages';
  import { columns } from '$lib/utils/admin/pages-columns';
  import { MetaTags } from 'svelte-meta-tags';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<MetaTags title={m['admin.pages.title']()} description={m['admin.pages.description']()} robots="noindex, nofollow" />

<div class="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
  <div class="mb-8 flex flex-wrap items-start justify-between gap-4">
    <div>
      <h1 class="text-3xl font-bold">{m['admin.pages.title']()}</h1>
      <p class="mt-2 text-muted-foreground">{m['admin.pages.description']()}</p>
    </div>
    <Button href="/admin/pages/new">{m['admin.pages.create_page']()}</Button>
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
