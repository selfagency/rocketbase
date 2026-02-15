<script lang="ts">
  import PortfolioForm from '$lib/components/admin/portfolio/portfolio-form.svelte';
  import { MetaTags } from 'svelte-meta-tags';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<MetaTags title={`Edit Portfolio: ${data.item.title || 'Untitled'} | Admin`} robots="noindex, nofollow" />

<div class="container mx-auto max-w-4xl py-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold">Edit Portfolio Item</h1>
    <p class="mt-2 text-muted-foreground">Update "{data.item.title || 'Untitled'}"</p>
  </div>

  <PortfolioForm {data} isEdit={true} itemId={data.item.id} />
</div>
