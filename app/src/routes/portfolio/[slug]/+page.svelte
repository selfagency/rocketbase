<script lang="ts">
  import { page } from '$app/state';
  import PortfolioHeader from '$lib/components/portfolio/PortfolioHeader.svelte';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import * as Dialog from '$lib/components/ui/dialog';
  import type { MediaResponse } from '$lib/types/pocketbase';
  import { getFileUrl } from '$lib/utils';
  import { MetaTags } from 'svelte-meta-tags';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const cdnUrl = $derived(data.metadata?.cdn_url);
  const coverImageUrl = $derived(
    data.item.image ? `${page.url.origin}${getFileUrl('portfolio', data.item.id, data.item.image, cdnUrl)}` : undefined
  );
  const media = $derived.by(() => {
    const expandedMedia = (data.item.expand as { media?: MediaResponse[] | MediaResponse } | undefined)?.media;
    if (Array.isArray(expandedMedia) && expandedMedia.length > 0) {
      return expandedMedia;
    }
    if (expandedMedia && typeof expandedMedia === 'object') {
      return [expandedMedia as MediaResponse];
    }

    const flattenedMedia = data.item.media;
    if (Array.isArray(flattenedMedia) && flattenedMedia.every(item => item && typeof item === 'object')) {
      return flattenedMedia as unknown as MediaResponse[];
    }
    if (flattenedMedia && typeof flattenedMedia === 'object') {
      return [flattenedMedia as unknown as MediaResponse];
    }

    return [] as MediaResponse[];
  });

  let lightboxOpen = $state(false);
  let selectedMedia = $state<MediaResponse | null>(null);

  function openLightbox(item: MediaResponse) {
    selectedMedia = item;
    lightboxOpen = true;
  }

  function closeLightbox() {
    lightboxOpen = false;
    selectedMedia = null;
  }

  function getMediaLabel(item: MediaResponse) {
    return item.caption || item.alt_text || item.file || 'Portfolio media';
  }

  function formatDate(value?: string) {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString();
  }

  $effect(() => {
    if (!lightboxOpen && selectedMedia) {
      selectedMedia = null;
    }
  });

  const metaTags = $derived({
    title: data.item.title || 'Portfolio',
    description: data.item.summary || 'Portfolio project',
    canonical: `${page.url.origin}/portfolio/${data.item.slug}`,
    openGraph: {
      type: 'article',
      url: `${page.url.origin}/portfolio/${data.item.slug}`,
      title: data.item.title || 'Portfolio',
      description: data.item.summary || 'Portfolio project',
      images: coverImageUrl
        ? [
            {
              url: coverImageUrl,
              width: 1200,
              height: 630,
              alt: data.item.title || 'Portfolio cover image',
            },
          ]
        : [],
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: data.item.title,
      headline: data.item.title,
      description: data.item.summary,
      image: coverImageUrl,
      url: `${page.url.origin}/portfolio/${data.item.slug}`,
      sameAs: data.item.url || undefined,
      dateModified: data.item.updated,
      associatedMedia: media
        .filter(item => item.file)
        .map(item => ({
          '@type': 'MediaObject',
          contentUrl: `${page.url.origin}${getFileUrl('media', item.id, item.file, cdnUrl)}`,
          description: item.caption || item.alt_text || undefined,
        })),
    },
  });
</script>

<MetaTags {...metaTags} />

<div class="mx-auto w-full max-w-5xl px-4 py-8 md:py-10">
  <article class="h-entry prose prose-lg max-w-none">
    <PortfolioHeader item={data.item} {cdnUrl} />

    {#if data.item.description}
      <section aria-labelledby="portfolio-description-heading" class="mb-10">
        <h2 id="portfolio-description-heading" class="mb-4 text-2xl font-semibold">Description</h2>
        <div class="e-content content">
          {@html data.item.description}
        </div>
      </section>
    {/if}

    <section aria-labelledby="portfolio-media-heading" class="not-prose mt-10">
      <h2 id="portfolio-media-heading" class="mb-4 text-2xl font-semibold">Media</h2>

      {#if media.length === 0}
        <Card.Root>
          <Card.Content class="p-6">
            <p class="text-muted-foreground">No media attached to this project yet.</p>
          </Card.Content>
        </Card.Root>
      {:else}
        <ul class="grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2" aria-label="Portfolio media gallery">
          {#each media as mediaItem (mediaItem.id)}
            <li>
              <Card.Root class="surface-enter overflow-hidden">
                {#if mediaItem.file}
                  <Button
                    type="button"
                    variant="ghost"
                    class="interactive-lift block h-auto w-full cursor-zoom-in rounded-none p-0 text-left"
                    onclick={() => openLightbox(mediaItem)}
                    aria-label={`Open ${getMediaLabel(mediaItem)} in full size`}
                  >
                    <img
                      src={getFileUrl('media', mediaItem.id, mediaItem.file, cdnUrl)}
                      alt={mediaItem.alt_text || mediaItem.caption || data.item.title || 'Portfolio media'}
                      class="h-64 w-full object-cover"
                      loading="lazy"
                    />
                  </Button>
                {/if}

                <Card.Content class="space-y-2 p-4 text-sm text-muted-foreground">
                  {#if mediaItem.caption}
                    <p class="leading-relaxed font-medium text-foreground">{mediaItem.caption}</p>
                  {/if}

                  <div class="flex flex-wrap gap-2">
                    {#if mediaItem.source}
                      <Badge variant="secondary">Source: {mediaItem.source}</Badge>
                    {/if}
                    {#if mediaItem.alt_text}
                      <Badge variant="outline">Alt text available</Badge>
                    {/if}
                  </div>

                  {#if mediaItem.alt_text}
                    <p><span class="font-medium text-foreground">Alt text:</span> {mediaItem.alt_text}</p>
                  {/if}
                  {#if mediaItem.source}
                    <p><span class="font-medium text-foreground">Source:</span> {mediaItem.source}</p>
                  {/if}
                  {#if mediaItem.source_url}
                    <p>
                      <span class="font-medium text-foreground">Source URL:</span>
                      <a
                        href={mediaItem.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="break-all text-primary underline"
                      >
                        {mediaItem.source_url}
                      </a>
                    </p>
                  {/if}
                  {#if mediaItem.created}
                    <p><span class="font-medium text-foreground">Uploaded:</span> {formatDate(mediaItem.created)}</p>
                  {/if}
                </Card.Content>
              </Card.Root>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  </article>
</div>

<Dialog.Root bind:open={lightboxOpen}>
  <Dialog.Content class="max-h-[92vh] w-[96vw] max-w-5xl overflow-hidden p-0 sm:w-[92vw]">
    <Dialog.Header class="border-b px-4 py-3 sm:px-6">
      <Dialog.Title>{selectedMedia ? getMediaLabel(selectedMedia) : 'Media preview'}</Dialog.Title>
      <Dialog.Description>
        Enlarged view of the selected portfolio media file with caption and related metadata.
      </Dialog.Description>
    </Dialog.Header>

    {#if selectedMedia?.file}
      <div class="max-h-[72vh] overflow-auto bg-black/95 p-3 sm:p-4">
        <img
          src={getFileUrl('media', selectedMedia.id, selectedMedia.file, cdnUrl)}
          alt={selectedMedia.alt_text || selectedMedia.caption || data.item.title || 'Portfolio media preview'}
          class="mx-auto h-auto max-h-[68vh] w-auto max-w-full object-contain"
        />
      </div>

      <div class="space-y-2 px-4 py-3 text-sm sm:px-6">
        {#if selectedMedia.caption}
          <p><span class="font-medium">Caption:</span> {selectedMedia.caption}</p>
        {/if}
        {#if selectedMedia.alt_text}
          <p><span class="font-medium">Alt text:</span> {selectedMedia.alt_text}</p>
        {/if}
        {#if selectedMedia.source}
          <p><span class="font-medium">Source:</span> {selectedMedia.source}</p>
        {/if}
        {#if selectedMedia.source_url}
          <p>
            <span class="font-medium">Source URL:</span>
            <a
              href={selectedMedia.source_url}
              target="_blank"
              rel="noopener noreferrer"
              class="break-all text-primary underline"
            >
              {selectedMedia.source_url}
            </a>
          </p>
        {/if}
        {#if selectedMedia.created}
          <p><span class="font-medium">Uploaded:</span> {formatDate(selectedMedia.created)}</p>
        {/if}
      </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>
