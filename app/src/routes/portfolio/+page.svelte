<script lang="ts">
  import { page } from '$app/state';
  import PortfolioList from '$lib/components/portfolio/PortfolioList.svelte';
  import { MetaTags } from 'svelte-meta-tags';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const metaTags = $derived({
    title: 'Portfolio',
    description: 'Selected projects and recent work.',
    canonical: `${page.url.origin}/portfolio`,
    openGraph: {
      type: 'website',
      url: `${page.url.origin}/portfolio`,
      title: 'Portfolio',
      description: 'Selected projects and recent work.',
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Portfolio',
      description: 'Selected projects and recent work.',
      url: `${page.url.origin}/portfolio`,
    },
  });
</script>

<MetaTags {...metaTags} />

<div class="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
  <div class="mb-8">
    <h1 class="mb-4 text-4xl font-bold tracking-tight">Portfolio</h1>
    {#if data.pagination.totalItems > 0}
      <p class="text-muted-foreground">
        {data.pagination.totalItems} project{data.pagination.totalItems === 1 ? '' : 's'}
      </p>
    {/if}
  </div>

  <PortfolioList items={data.items} pagination={data.pagination} cdnUrl={data.metadata?.cdn_url} />
</div>
