<script lang="ts">
  import type { PortfolioResponseWithExpanded } from '$lib/types/pocketbase-expanded';
  import { getFileUrl } from '$lib/utils';
  import LinkIcon from '@lucide/svelte/icons/link';

  interface Props {
    item: PortfolioResponseWithExpanded;
    cdnUrl?: string;
  }

  let { item, cdnUrl }: Props = $props();
</script>

<header class="surface-enter mb-8 font-sans">
  <h1 class="p-name group mb-4 flex items-center gap-2 text-3xl leading-tight font-bold">
    {item.title || 'Untitled project'}
    <a
      href={`/portfolio/${item.slug}`}
      class="u-url u-uid rounded-sm opacity-0 transition-opacity group-hover:opacity-100 hover:text-primary focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
      aria-label="Permalink"
    >
      <LinkIcon class="h-5 w-5" aria-hidden="true" />
    </a>
  </h1>

  {#if item.summary}
    <p class="p-summary mb-4 text-lg leading-relaxed text-muted-foreground">{item.summary}</p>
  {/if}

  {#if item.url}
    <p class="mb-4 text-sm">
      <a
        href={item.url}
        rel="external noopener noreferrer"
        target="_blank"
        class="u-url rounded-sm break-all text-primary underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        {item.url}
      </a>
    </p>
  {/if}

  {#if item.image}
    <img
      src={getFileUrl('portfolio', item.id, item.image, cdnUrl)}
      alt={item.title || 'Portfolio cover image'}
      class="u-photo mb-6 h-72 w-full rounded-lg object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:scale-[1.01] motion-reduce:transform-none"
      loading="eager"
      decoding="async"
    />
  {/if}

  <p class="text-sm text-muted-foreground">
    <time class="dt-updated" datetime={item.updated}>Updated {new Date(item.updated).toLocaleDateString()}</time>
  </p>
</header>
