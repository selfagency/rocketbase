<script lang="ts" generics="TData, TValue">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { Button } from '$lib/components/ui/button';
  import * as ButtonGroup from '$lib/components/ui/button-group';
  import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table';
  import { Input } from '$lib/components/ui/input';
  import * as Table from '$lib/components/ui/table';
  import * as Tooltip from '$lib/components/ui/tooltip';
  import {
    getResponsiveColumnVisibility,
    getColumnCellClass as getSharedColumnCellClass,
    getColumnWidthClass as getSharedColumnWidthClass,
    getSortState,
  } from '$lib/utils/admin/data-table-utils';
  import ArrowDownUpIcon from '@lucide/svelte/icons/arrow-down-up';
  import { type ColumnDef, type VisibilityState, getCoreRowModel } from '@tanstack/table-core';
  import { onMount } from 'svelte';

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
  let columnVisibility = $state<VisibilityState>({});
  let searchTimeout: ReturnType<typeof setTimeout> | undefined;

  function syncColumnVisibility(width: number) {
    columnVisibility = getResponsiveColumnVisibility({
      current: columnVisibility,
      width,
      breakpoint: 1280,
    });
  }

  onMount(() => {
    syncColumnVisibility(window.innerWidth);

    const onResize = () => {
      syncColumnVisibility(window.innerWidth);
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  });

  const table = createSvelteTable({
    get data() {
      return data;
    },
    get columns() {
      return columns;
    },
    state: {
      get columnVisibility() {
        return columnVisibility;
      },
    },
    onColumnVisibilityChange: updater => {
      if (typeof updater === 'function') {
        columnVisibility = updater(columnVisibility);
      } else {
        columnVisibility = updater;
      }
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
    return getSortState({
      currentSort: page.url.searchParams.get('sort') || '',
      sortKey,
    });
  }

  const columnWidthClasses: Record<string, string> = {
    image: 'w-16 min-w-16 max-w-16 pr-2',
    title: 'min-w-72 max-w-[40rem] lg:min-w-56 lg:max-w-[34rem]',
    slug: 'min-w-28 max-w-44',
    summary: 'min-w-44 max-w-72',
    author: 'min-w-14 max-w-24 lg:min-w-20 lg:max-w-40',
    published: 'w-14 min-w-14 max-w-14 text-center md:w-28 md:min-w-28 md:max-w-28',
    date: 'w-24 min-w-24 max-w-28 whitespace-nowrap',
    updated: 'w-28 min-w-28 max-w-36 whitespace-nowrap',
    actions: 'w-12 min-w-12 max-w-12 pr-2 pl-1 text-right whitespace-nowrap',
  };

  const columnCellBehaviorClasses: Record<string, string> = {
    title: 'whitespace-normal wrap-break-word align-middle',
    author: 'whitespace-normal wrap-break-word align-middle',
  };

  function getColumnWidthClass(columnId: string) {
    return getSharedColumnWidthClass(columnWidthClasses, columnId);
  }

  function getColumnCellClass(columnId: string) {
    return getSharedColumnCellClass({
      columnWidthClasses,
      columnBehaviorClasses: columnCellBehaviorClasses,
      columnId,
    });
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
        <select
          id="author-filter"
          aria-label="Filter by author"
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

      <ButtonGroup.Root class="rounded-lg border bg-white [&_button]:font-normal">
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
        <Button
          variant={statusValue === 'trash' ? 'default' : 'ghost'}
          size="sm"
          onclick={() => {
            statusValue = 'trash';
          }}
        >
          Trash
        </Button>
      </ButtonGroup.Root>
    </div>

    <div class="overflow-hidden rounded-md border">
      <Table.Root class="w-full table-fixed">
        <Table.Header>
          {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
            <Table.Row>
              {#each headerGroup.headers as header (header.id)}
                <Table.Head class={`${getColumnWidthClass(header.column.id)} text-xs`}>
                  {#if !header.isPlaceholder}
                    {#if (header.column.columnDef as any)?.meta?.sortKey}
                      <button
                        class="flex items-center gap-2 text-xs transition-colors hover:text-foreground"
                        onclick={() => navigateToSort((header.column.columnDef as any).meta.sortKey)}
                      >
                        <FlexRender content={header.column.columnDef.header} context={header.getContext()} />
                        <ArrowDownUpIcon
                          class="h-3.5 w-3.5 {isSortState((header.column.columnDef as any).meta.sortKey).asc ||
                          isSortState((header.column.columnDef as any).meta.sortKey).desc
                            ? 'text-foreground'
                            : 'text-muted-foreground'}"
                          aria-hidden="true"
                        />
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
                <Table.Cell class={getColumnCellClass(cell.column.id)}>
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
