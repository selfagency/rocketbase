<script lang="ts" generics="TData, TValue">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import * as ButtonGroup from '$lib/components/ui/button-group';
	import * as Combobox from '$lib/components/ui/combobox';
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import GripVerticalIcon from '@lucide/svelte/icons/grip-vertical';
	import { type ColumnDef, getCoreRowModel } from '@tanstack/table-core';

	type DataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[];
		data: TData[];
		currentPage: number;
		totalPages: number;
		totalItems: number;
		status: string;
		authors?: { id: string; name: string }[];
	};

	let {
		data,
		columns,
		currentPage,
		totalPages,
		totalItems,
		status,
		authors = [] // Default value for authors
	}: DataTableProps<TData, TValue> = $props();

	// Get current search from URL
	let searchValue = $state(page.url.searchParams.get('search') || '');
	let authorValue = $state(page.url.searchParams.get('author') || '');
	// svelte-ignore state_referenced_locally
	let statusValue = $state(status);
	let searchTimeout: ReturnType<typeof setTimeout> | undefined;
	let authorTimeout: ReturnType<typeof setTimeout> | undefined;

	let augmentedData = $derived(() => {
		const authorsMap = new Map<string, { id: string; name: string }>();
		for (const a of authors || []) authorsMap.set(a.id, a);

		return (data || []).map((item: any) => {
			const out = { ...item } as any;
			out.expand = out.expand ?? {};
			if (!out.expand.author && out.author) {
				const found = authorsMap.get(out.author);
				if (found) {
					out.expand.author = { id: found.id, name: found.name };
				}
			}
			return out;
		});
	});

	const table = createSvelteTable({
		get data() {
			return augmentedData();
		},
		get columns() {
			return columns;
		},
		getCoreRowModel: getCoreRowModel()
	});

	let draggingId: string | null = $state(null);

	function onDragStart(e: DragEvent, id: string) {
		draggingId = id;
		e.dataTransfer?.setData('text/plain', id);
		e.dataTransfer!.effectAllowed = 'move';
	}

	function onDragOver(e: DragEvent) {
		e.preventDefault();
		const tr = e.currentTarget as HTMLElement;
		tr.classList.add('drag-over');
	}

	function onDragLeave(e: DragEvent) {
		const tr = e.currentTarget as HTMLElement;
		tr.classList.remove('drag-over');
	}

	async function onDrop(e: DragEvent, targetId: string) {
		e.preventDefault();
		const sourceId = e.dataTransfer?.getData('text/plain') || draggingId;
		if (!sourceId || sourceId === targetId) return;

		// Use table row model to compute indexes (TanStack style)
		const rows = table.getRowModel().rows;
		const ids = rows.map((r) => (r.original as any).id || (r as any).id);
		const srcIndex = ids.indexOf(sourceId);
		const tgtIndex = ids.indexOf(targetId);
		if (srcIndex === -1 || tgtIndex === -1) return;

		// reorder ids array by moving source to target index
		const newIds = [...ids];
		newIds.splice(srcIndex, 1);
		newIds.splice(tgtIndex, 0, sourceId);

		// Optimistic UI: reorder local data by calling server and then reload
		try {
			const res = await fetch('/admin/pages/reorder', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ order: newIds })
			});
			if (res.ok) {
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

	function navigateToSort(sortKey: string) {
		const params = new URLSearchParams(page.url.searchParams);
		const current = params.get('sort') || '';
		// toggle descending
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

	function handleAuthorSearch(value: string) {
		authorValue = value;
		clearTimeout(authorTimeout);
		authorTimeout = setTimeout(() => {
			const params = new URLSearchParams(page.url.searchParams);
			if (value) params.set('author', value);
			else params.delete('author');
			params.set('page', '1');
			goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
		}, 300);
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
		<Combobox.Root
			options={[{ id: '', name: 'All authors' }, ...authors]}
			value={authorValue}
			placeholder="Select author..."
			onchange={handleAuthorSearch}
		/>

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

		<Button href="/admin/pages/new" class="ms-auto">Create Page</Button>
	</div>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row>
						<!-- Drag handle header cell to align with body drag handle -->
						<Table.Head class="w-8"></Table.Head>
						{#each headerGroup.headers as header (header.id)}
							<Table.Head>
								{#if !header.isPlaceholder}
									{#if (header.column.columnDef as any)?.meta?.sortKey}
										<button
											class="flex items-center gap-2"
											onclick={() => navigateToSort((header.column.columnDef as any).meta.sortKey)}
										>
											<FlexRender
												content={header.column.columnDef.header}
												context={header.getContext()}
											/>
											{#if isSortState((header.column.columnDef as any).meta.sortKey).asc}
												<span aria-hidden="true">▴</span>
											{:else if isSortState((header.column.columnDef as any).meta.sortKey).desc}
												<span aria-hidden="true">▾</span>
											{/if}
										</button>
									{:else}
										<FlexRender
											content={header.column.columnDef.header}
											context={header.getContext()}
										/>
									{/if}
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>
			<Table.Body>
				{#each table.getRowModel().rows as row (row.id)}
					{@const rowId = (row as any).original?.id || (row as any).id}
					<tr
						data-id={rowId}
						draggable="true"
						ondragstart={(e) => onDragStart(e as DragEvent, rowId)}
						ondragover={(e) => onDragOver(e as DragEvent)}
						ondragleave={(e) => onDragLeave(e as DragEvent)}
						ondrop={(e) => onDrop(e as DragEvent, rowId)}
						class:cursor-grabbing={draggingId === rowId}
					>
						<!-- Drag handle cell -->
						<Table.Cell class="w-8 text-center">
							<button
								class="text-muted-foreground hover:text-foreground"
								aria-label="Drag to reorder"
								title="Drag to reorder"
							>
								<GripVerticalIcon class="h-4 w-4 text-gray-400" aria-hidden="true" />
							</button>
						</Table.Cell>
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell>
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/each}
					</tr>
				{:else}
					<tr>
						<Table.Cell colspan={columns.length + 1} class="h-24 text-center">
							No pages found.
						</Table.Cell>
					</tr>
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
