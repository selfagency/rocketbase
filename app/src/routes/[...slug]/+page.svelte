<script lang="ts">
  import { page as pageState } from '$app/state';
  import PageContent from '$lib/components/pages/PageContent.svelte';
  import { getFileUrl } from '$lib/utils';
  import { getSocialImageUrl } from '$lib/utils/image-sizes';
  import { MetaTags } from 'svelte-meta-tags';

  let { data } = $props();

  const featuredImageUrl = $derived(
    data.page?.image ? `${pageState.url.origin}${getFileUrl('pages', data.page.id, data.page.image)}` : undefined
  );
  const facebookOgImageUrl = $derived(featuredImageUrl ? getSocialImageUrl(featuredImageUrl, 'facebook') : undefined);

  const metaTags = $derived({
    title: data.page?.title,
    description: data.page?.summary,
    canonical: pageState.url.href,
    openGraph: {
      type: 'website',
      url: pageState.url.href,
      title: data.page?.title,
      description: data.page?.summary,
      images: facebookOgImageUrl
        ? [
            {
              url: facebookOgImageUrl,
              width: 1200,
              height: 630,
              alt: data.page?.title || 'Page image',
            },
          ]
        : [],
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: data.page?.title,
      description: data.page?.summary,
      image: facebookOgImageUrl,
      url: pageState.url.href,
    },
  });
</script>

<MetaTags {...metaTags} />

{#if data.page}
  <PageContent page={data.page} />
{:else}
  <main id="main-content" class="surface-enter mx-auto w-full max-w-4xl px-4 py-8 md:py-10">
    <section class="rounded-lg border border-border bg-card p-6 text-center">
      <h1 class="text-2xl font-semibold">Page not found</h1>
      <p class="mt-2 text-muted-foreground">The page you requested could not be loaded.</p>
    </section>
  </main>
{/if}
