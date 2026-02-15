<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import * as Pagination from '$lib/components/ui/pagination';
  import type { PortfolioResponseWithExpanded } from '$lib/types/pocketbase-expanded';
  import PortfolioCard from './PortfolioCard.svelte';

  interface PaginationData {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
  }

  interface Props {
    items: PortfolioResponseWithExpanded[];
    pagination: PaginationData;
    cdnUrl?: string;
  }

  let { items, pagination, cdnUrl }: Props = $props();

  function handlePageChange(nextPage: number) {
    const params = new URLSearchParams(page.url.searchParams);
    params.set('page', String(nextPage));
    goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
  }
</script>

{#if items.length === 0}
  <div class="rounded-lg border border-dashed p-10 text-center">
    <h2 class="text-xl font-semibold">No portfolio items yet</h2>
    <p class="mt-2 text-muted-foreground">Check back soon for project updates.</p>
  </div>
{:else}
  <section class="h-feed grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-label="Portfolio items">
    {#each items as item (item.id)}
      <PortfolioCard {item} {cdnUrl} />
    {/each}
  </section>

  {#if pagination.totalPages > 1}
    <div class="mt-8 flex justify-center">
      <Pagination.Root
        count={pagination.totalItems}
        page={pagination.page}
        perPage={pagination.perPage}
        onPageChange={handlePageChange}
      >
        {#snippet children({ pages, currentPage })}
          <Pagination.Content>
            <Pagination.Item>
              <Pagination.PrevButton />
            </Pagination.Item>
            {#each pages as pageItem}
              {#if pageItem.type === 'ellipsis'}
                <Pagination.Item>
                  <Pagination.Ellipsis />
                </Pagination.Item>
              {:else}
                <Pagination.Item>
                  <Pagination.Link page={pageItem} isActive={currentPage === pageItem.value}>
                    {pageItem.value}
                  </Pagination.Link>
                </Pagination.Item>
              {/if}
            {/each}
            <Pagination.Item>
              <Pagination.NextButton />
            </Pagination.Item>
          </Pagination.Content>
        {/snippet}
      </Pagination.Root>
    </div>
  {/if}
{/if}
