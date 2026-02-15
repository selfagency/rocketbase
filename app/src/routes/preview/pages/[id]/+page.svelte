<script lang="ts">
  import { page as pageState } from '$app/state';
  import PageContent from '$lib/components/pages/PageContent.svelte';
  import { MetaTags } from 'svelte-meta-tags';

  let { data } = $props();

  const metaTags = $derived({
    title: `${data.page?.title || 'Page'} (Preview)`,
    description: data.page?.summary,
    canonical: pageState.url.href,
    robots: 'noindex,nofollow',
    openGraph: {
      type: 'website',
      url: pageState.url.href,
      title: `${data.page?.title || 'Page'} (Preview)`,
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

<div class="container mx-auto max-w-4xl px-4 py-8">
  <p
    class="mb-6 rounded-md border border-dashed border-amber-500/70 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:bg-amber-900/20 dark:text-amber-100"
  >
    This is a preview of an unpublished draft.
  </p>

  {#if data.page}
    <PageContent page={data.page} />
  {/if}
</div>
