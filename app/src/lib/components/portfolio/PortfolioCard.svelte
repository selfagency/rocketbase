<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import type { PortfolioResponseWithExpanded } from '$lib/types/pocketbase-expanded';
  import { getFileUrl } from '$lib/utils';

  interface Props {
    item: PortfolioResponseWithExpanded;
    cdnUrl?: string;
  }

  let { item, cdnUrl }: Props = $props();
</script>

<Card.Root class="interactive-lift surface-enter h-entry overflow-hidden transition-shadow hover:shadow-lg">
  {#if item.image}
    <div class="aspect-video overflow-hidden">
      <img
        src={getFileUrl('portfolio', item.id, item.image, cdnUrl)}
        alt={item.title || 'Portfolio item cover image'}
        class="u-photo h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:scale-105 motion-reduce:transform-none"
        loading="lazy"
        decoding="async"
      />
    </div>
  {/if}

  <Card.Content class="space-y-3 p-6">
    <h2 class="p-name text-xl font-semibold">
      <a
        href={`/portfolio/${item.slug}`}
        class="u-url rounded-sm transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        {item.title || 'Untitled project'}
      </a>
    </h2>

    {#if item.summary}
      <p class="p-summary text-muted-foreground">{item.summary}</p>
    {/if}

    <div class="text-sm text-muted-foreground">
      <time class="dt-updated" datetime={item.updated}>
        Updated {new Date(item.updated).toLocaleDateString()}
      </time>
    </div>
  </Card.Content>
</Card.Root>
