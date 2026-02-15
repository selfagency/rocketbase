<script lang="ts">
  import { page } from '$app/state';
  import { Button } from '$lib/components/ui/button';
  import type { MediaResponse, PagesResponse } from '$lib/types/pocketbase';
  import { getFileUrl } from '$lib/utils';
  import { MetaTags } from 'svelte-meta-tags';

  let { page: pageData }: { page: PagesResponse } = $props();
  type LegacyPage = PagesResponse & { media?: string[] };

  const expandedAttachments = $derived(
    (pageData.expand as { attachments?: MediaResponse[] } | undefined)?.attachments || []
  );
  const legacyMedia = $derived(
    ((pageData as LegacyPage).media || []).map(file => ({
      id: pageData.id,
      file,
      alt_text: 'Media file',
      caption: '',
    }))
  );

  const attachments = $derived(expandedAttachments.length > 0 ? expandedAttachments : legacyMedia);
  const isLegacyMedia = $derived(expandedAttachments.length === 0 && legacyMedia.length > 0);
  const featuredAttachment = $derived(attachments[0]);

  const metaTags = $derived({
    title: pageData.title || 'Page',
    description: pageData.summary,
    canonical: `${page.url.origin}/${pageData.slug}`,
    openGraph: {
      type: 'website',
      url: `${page.url.origin}/${pageData.slug}`,
      title: pageData.title || 'Page',
      description: pageData.summary,
      images: pageData.image
        ? [
            {
              url: `${page.url.origin}/api/pb/files/pages/${pageData.id}/${pageData.image}`,
              width: 1200,
              height: 630,
              alt: pageData.title || 'Page',
            },
          ]
        : [],
    },
  });
</script>

<MetaTags {...metaTags} />

{#if pageData.custom_css}
  {@html `<style>${pageData.custom_css}</style>`}
{/if}

<div class="container mx-auto max-w-4xl px-4 py-8">
  <article class="h-entry prose prose-lg max-w-none">
    {#if pageData.title}
      <header class="mb-8">
        <h1 class="p-name mb-4 text-3xl leading-tight font-bold">
          {pageData.title}
        </h1>
        <data class="u-url hidden" value={`${page.url.origin}/${pageData.slug}`}></data>
        {#if pageData.summary}
          <p class="p-summary text-xl leading-relaxed text-muted-foreground">
            {pageData.summary}
          </p>
        {/if}
        {#if pageData.image}
          <img
            src="{page.url.origin}/api/pb/files/pages/{pageData.id}/{pageData.image}"
            alt={pageData.title || 'Page image'}
            class="u-featured mt-6 h-64 w-full rounded-lg object-cover"
          />
        {/if}
      </header>
    {/if}

    {#if pageData.content}
      <div class="e-content content">
        {@html pageData.content}
      </div>
    {:else}
      <div class="py-12 text-center">
        <p class="text-lg text-muted-foreground">This page doesn't have any content yet.</p>
      </div>
    {/if}
  </article>

  {#if attachments.length > 0}
    <section class="mt-12">
      <h2 class="mb-6 text-2xl font-semibold">Media</h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {#each attachments as mediaItem}
          <div class="aspect-square">
            {#if mediaItem.file}
              <img
                src={isLegacyMedia
                  ? `${page.url.origin}/api/pb/files/pages/${pageData.id}/${mediaItem.file}`
                  : getFileUrl('media', mediaItem.id, mediaItem.file)}
                alt={mediaItem.alt_text || mediaItem.caption || 'Media file'}
                class="h-full w-full rounded-lg object-cover"
              />
            {/if}
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <footer class="mt-12 border-t pt-8">
    <div class="flex items-center justify-between">
      <div class="text-sm text-muted-foreground">
        <time datetime={pageData.updated}>
          Last updated: {new Date(pageData.updated).toLocaleDateString()}
        </time>
      </div>
      <Button href="/" variant="outline">Home</Button>
    </div>
  </footer>
</div>
