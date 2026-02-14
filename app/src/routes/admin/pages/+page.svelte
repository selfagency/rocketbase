<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import type { PageData } from './$types';
	import { columns } from './columns.js';
	import DataTable from './data-table.svelte';

	let { data }: { data: PageData } = $props();
</script>

<div class="container mx-auto py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold">{m.admin_pages_title()}</h1>
		<p class="mt-2 text-muted-foreground">{m.admin_pages_description()}</p>
	</div>

	<DataTable
		data={data.pages}
		{columns}
		currentPage={data.page}
		totalPages={data.totalPages}
		totalItems={data.totalItems}
		status={data.status}
		authors={data.authors}
	/>
</div>
