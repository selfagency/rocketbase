<script lang="ts">
	import DataTable from './data-table.svelte';
	import { columns } from './columns.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="container mx-auto py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold">Pages</h1>
		<p class="text-muted-foreground mt-2">Manage your site pages and content.</p>
	</div>

	<DataTable
		data={data.pages}
		{columns}
		currentPage={data.page}
		totalPages={data.totalPages}
		totalItems={data.totalItems}
	/>
</div>
