<script lang="ts">
  import { page as pageState } from '$app/state';
  import PageContent from '$lib/components/pages/PageContent.svelte';
  import { MetaTags } from 'svelte-meta-tags';

  let { data } = $props();

  const metaTags = $derived({
    title: data.page?.title,
    description: data.page?.summary,
    canonical: pageState.url.href,
    openGraph: {
      type: 'website',
      url: pageState.url.href,
      title: data.page?.title,
      description: data.page?.summary,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: data.page?.title,
      description: data.page?.summary,
      url: pageState.url.href,
    },
  });
</script>

<MetaTags {...metaTags} />

{#if data.page}
  <PageContent page={data.page} />
{/if}
