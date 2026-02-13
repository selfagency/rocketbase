<script lang="ts" generics="TData, TValue">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button/index.js';
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { type ColumnDef, getCoreRowModel } from '@tanstack/table-core';

	type DataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[];
		data: TData[];
		currentPage: number;
		totalPages: number;
		totalItems: number;
		status: string;
	};

	let {
		data,
		columns,
		currentPage,
		totalPages,
		totalItems,
		status
	}: DataTableProps<TData, TValue> = $props();

	// Get current search from URL
	let searchValue = $state(page.url.searchParams.get('search') || '');
	// svelte-ignore state_referenced_locally
	let statusValue = $state(status);
	let searchTimeout: ReturnType<typeof setTimeout> | undefined;

	const table = createSvelteTable({
		get data() {
			return data;
		},
		get columns() {
			return columns;
		},
		getCoreRowModel: getCoreRowModel()
	});

	function handleSearch(value: string) {
		searchValue = value;

		// Debounce search
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			const params = new URLSearchParams(page.url.searchParams);
			if (value) {
				params.set('search', value);
			} else {
				params.delete('search');
			}
			params.set('page', '1'); // Reset to first page on search
			goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
		}, 300);
	}

	function navigateToPage(pageNum: number) {
		const params = new URLSearchParams(page.url.searchParams);
		params.set('page', pageNum.toString());
		goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
	}

	// Watch for status changes
	$effect(() => {
		if (statusValue !== status) {
			const params = new URLSearchParams(page.url.searchParams);
			if (statusValue && statusValue !== 'all') {
				params.set('status', statusValue);
			} else {
				params.delete('status');
			}
			params.set('page', '1'); // Reset to first page on filter change
			goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
		}
	});
</script>

<div class="w-full">
	<div class="flex items-center gap-4 py-4">
		<Input
			placeholder="Search by title or slug..."
			value={searchValue}
			oninput={(e) => handleSearch(e.currentTarget.value)}
			class="max-w-sm"
		/>
		<Select.Root type="single" bind:value={statusValue}>
			<Select.Trigger class="w-45">
				{statusValue === 'draft' ? 'Draft' : statusValue === 'published' ? 'Published' : 'All'}
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="all">All</Select.Item>
				<Select.Item value="draft">Draft</Select.Item>
				<Select.Item value="published">Published</Select.Item>
			</Select.Content>
		</Select.Root>
		<Button href="/admin/pages/new" class="ms-auto">Create Page</Button>
	</div>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row>
						{#each headerGroup.headers as header (header.id)}
							<Table.Head>
								{#if !header.isPlaceholder}
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>
			<Table.Body>
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
						<Table.Cell colspan={columns.length} class="h-24 text-center">
							No pages found.
						</Table.Cell>
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
			<Button
				variant="outline"
				size="sm"
				onclick={() => navigateToPage(currentPage - 1)}
				disabled={currentPage <= 1}
			>
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
