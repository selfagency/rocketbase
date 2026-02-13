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

	let draggingId: string | null = null;

	function onDragStart(e: DragEvent, id: string) {
		draggingId = id;
		e.dataTransfer?.setData('text/plain', id);
		e.dataTransfer?.setData('application/my-app', id);
		e.dataTransfer!.effectAllowed = 'move';
	}

	function onDragOver(e: DragEvent) {
		e.preventDefault();
		const tr = (e.currentTarget as HTMLElement);
		tr.classList.add('drag-over');
	}

	function onDragLeave(e: DragEvent) {
		const tr = (e.currentTarget as HTMLElement);
		tr.classList.remove('drag-over');
	}

	async function onDrop(e: DragEvent, targetId: string) {
		e.preventDefault();
		const tr = (e.currentTarget as HTMLElement);
		tr.classList.remove('drag-over');
		const sourceId = e.dataTransfer?.getData('text/plain') || draggingId;
		if (!sourceId || sourceId === targetId) return;

		// build new order by reading DOM row order
		const rows = Array.from(document.querySelectorAll('[data-id]')) as HTMLElement[];
		const ids = rows.map((r) => r.getAttribute('data-id') || '');

		// move sourceId before targetId
		const srcIndex = ids.indexOf(sourceId);
		const tgtIndex = ids.indexOf(targetId);
		if (srcIndex === -1 || tgtIndex === -1) return;
		ids.splice(srcIndex, 1);
		ids.splice(tgtIndex, 0, sourceId);

		// send order to server
		try {
			const res = await fetch('/admin/pages/reorder', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ order: ids })
			});
			if (res.ok) {
				// reload to reflect server-side ordering
				location.reload();
			} else {
				console.error('Failed to save order', await res.text());
			}
		} catch (err) {
			console.error('Failed to save order', err);
		}
	}

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
						<Table.Row data-id={(row as any).original?.id || (row as any).id} draggable="true"
							ondragstart={(e) => onDragStart(e, (row as any).original?.id || (row as any).id)}
							ondragover={onDragOver}
							ondragleave={onDragLeave}
							ondrop={(e) => onDrop(e, (row as any).original?.id || (row as any).id)}>
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
