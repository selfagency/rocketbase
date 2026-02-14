<script lang="ts" generics="TData, TValue">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { Button } from '$lib/components/ui/button';
  import * as ButtonGroup from '$lib/components/ui/button-group';
  import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table';
  import { Input } from '$lib/components/ui/input';
  import * as Table from '$lib/components/ui/table';
  import * as Tooltip from '$lib/components/ui/tooltip';
  import ArrowDown01Icon from '@lucide/svelte/icons/arrow-down-0-1';
  import ArrowDown10Icon from '@lucide/svelte/icons/arrow-down-1-0';
  import ArrowDownUpIcon from '@lucide/svelte/icons/arrow-down-up';
  import { type ColumnDef, getCoreRowModel } from '@tanstack/table-core';
  import { fade } from 'svelte/transition';

  type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    status: string;
    authors: { id: string; name: string }[];
    selectedAuthor: string;
  };

  let {
    data,
    columns,
    currentPage,
    totalPages,
    totalItems,
    status,
    authors,
    selectedAuthor,
  }: DataTableProps<TData, TValue> = $props();

  let searchValue = $state(page.url.searchParams.get('search') || '');
  // svelte-ignore state_referenced_locally
  let statusValue = $state(status);
  // svelte-ignore state_referenced_locally
  let authorValue = $state(selectedAuthor);
  let searchTimeout: ReturnType<typeof setTimeout> | undefined;

  const table = createSvelteTable({
    get data() {
      return data;
    },
    get columns() {
      return columns;
    },
    getCoreRowModel: getCoreRowModel(),
  });

  function handleSearch(value: string) {
    searchValue = value;

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const params = new URLSearchParams(page.url.searchParams);
      if (value) {
        params.set('search', value);
      } else {
        params.delete('search');
      }
      params.set('page', '1');
      goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
    }, 300);
  }

  function navigateToPage(pageNum: number) {
    const params = new URLSearchParams(page.url.searchParams);
    params.set('page', pageNum.toString());
    goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
  }

  function navigateToSort(sortKey: string) {
    const params = new URLSearchParams(page.url.searchParams);
    const current = params.get('sort') || '';

    if (current === sortKey) {
      params.set('sort', `-${sortKey}`);
    } else if (current === `-${sortKey}`) {
      params.delete('sort');
    } else {
      params.set('sort', sortKey);
    }

    params.set('page', '1');
    goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
  }

  function isSortState(sortKey: string) {
    const current = page.url.searchParams.get('sort') || '';
    return { asc: current === sortKey, desc: current === `-${sortKey}` };
  }

  function onAuthorChange(value: string) {
    authorValue = value;
    const params = new URLSearchParams(page.url.searchParams);
    if (value) {
      params.set('author', value);
    } else {
      params.delete('author');
    }
    params.set('page', '1');
    goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
  }

  $effect(() => {
    if (statusValue !== status) {
      const params = new URLSearchParams(page.url.searchParams);
      if (statusValue && statusValue !== 'all') {
        params.set('status', statusValue);
      } else {
        params.delete('status');
      }
      params.set('page', '1');
      goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
    }
  });
</script>

<Tooltip.Provider>
  <div class="w-full">
    <div class="flex flex-wrap items-center gap-4 py-4">
      <Input
        placeholder="Search posts by title, slug, or summary"
        value={searchValue}
        oninput={e => handleSearch(e.currentTarget.value)}
        class="max-w-sm"
        aria-label="Search posts"
      />

      <div class="flex items-center gap-2">
        <label for="author-filter" class="text-sm font-medium">Author</label>
        <select
          id="author-filter"
          value={authorValue}
          onchange={e => onAuthorChange(e.currentTarget.value)}
          class="flex h-10 min-w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">All authors</option>
          {#each authors as author (author.id)}
            <option value={author.id}>{author.name}</option>
          {/each}
        </select>
      </div>

      <ButtonGroup.Root class="rounded-lg border bg-white">
        <Button
          variant={statusValue === 'all' ? 'default' : 'ghost'}
          size="sm"
          onclick={() => {
            statusValue = 'all';
          }}
        >
          All
        </Button>
        <Button
          variant={statusValue === 'draft' ? 'default' : 'ghost'}
          size="sm"
          onclick={() => {
            statusValue = 'draft';
          }}
        >
          Drafts
        </Button>
        <Button
          variant={statusValue === 'published' ? 'default' : 'ghost'}
          size="sm"
          onclick={() => {
            statusValue = 'published';
          }}
        >
          Published
        </Button>
      </ButtonGroup.Root>

      <Button href="/admin/posts/new" class="ms-auto">Create Post</Button>
    </div>

    <div class="overflow-hidden rounded-md border">
      <Table.Root>
        <Table.Header>
          {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
            <Table.Row>
              {#each headerGroup.headers as header (header.id)}
                <Table.Head>
                  {#if !header.isPlaceholder}
                    {#if (header.column.columnDef as any)?.meta?.sortKey}
                      <button
                        class="flex items-center gap-2 transition-colors hover:text-foreground"
                        onclick={() => navigateToSort((header.column.columnDef as any).meta.sortKey)}
                      >
                        <FlexRender content={header.column.columnDef.header} context={header.getContext()} />
                        {#if (header.column.columnDef as any).meta.sortKey === 'date'}
                          {@const sortState = isSortState((header.column.columnDef as any).meta.sortKey)}
                          <div class="relative h-4 w-4">
                            {#if sortState.desc}
                              <span class="absolute inset-0" transition:fade={{ duration: 150 }}>
                                <ArrowDown10Icon class="h-4 w-4 text-foreground" aria-hidden="true" />
                              </span>
                            {:else}
                              <span class="absolute inset-0" transition:fade={{ duration: 150 }}>
                                <ArrowDown01Icon
                                  class="h-4 w-4 {sortState.asc ? 'text-foreground' : 'text-muted-foreground'}"
                                  aria-hidden="true"
                                />
                              </span>
                            {/if}
                          </div>
                        {:else}
                          <ArrowDownUpIcon
                            class="h-4 w-4 {isSortState((header.column.columnDef as any).meta.sortKey).asc ||
                            isSortState((header.column.columnDef as any).meta.sortKey).desc
                              ? 'text-foreground'
                              : 'text-muted-foreground'}"
                            aria-hidden="true"
                          />
                        {/if}
                      </button>
                    {:else}
                      <FlexRender content={header.column.columnDef.header} context={header.getContext()} />
                    {/if}
                  {/if}
                </Table.Head>
              {/each}
            </Table.Row>
          {/each}
        </Table.Header>
        <Table.Body class="bg-white">
          {#each table.getRowModel().rows as row (row.id)}
            <Table.Row>
              {#each row.getVisibleCells() as cell (cell.id)}
                <Table.Cell>
                  <FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
                </Table.Cell>
              {/each}
            </Table.Row>
          {:else}
            <Table.Row>
              <Table.Cell colspan={columns.length} class="h-24 text-center">No posts found.</Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </div>

    <div class="flex items-center justify-between space-x-2 pt-4">
      <div class="text-sm text-muted-foreground">
        Showing page {currentPage} of {totalPages} ({totalItems} total)
      </div>
      <div class="space-x-2">
        <Button variant="outline" size="sm" onclick={() => navigateToPage(currentPage - 1)} disabled={currentPage <= 1}>
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onclick={() => navigateToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  </div>
</Tooltip.Provider>
