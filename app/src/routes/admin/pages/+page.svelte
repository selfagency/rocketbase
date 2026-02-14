<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { MetaTags } from 'svelte-meta-tags';
	import type { PageData } from './$types';
	import { columns } from './columns.js';
	import DataTable from './data-table.svelte';

	let { data }: { data: PageData } = $props();
</script>

<MetaTags
	title={m['admin.pages.title']()}
	description={m['admin.pages.description']()}
	noindex={true}
	nofollow={true}
/>

<div class="container mx-auto py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold">{m['admin.pages.title']()}</h1>
		<p class="mt-2 text-muted-foreground">{m['admin.pages.description']()}</p>
	</div>

	<DataTable
		data={data.pages}
		{columns}
		currentPage={data.page}
		totalPages={data.totalPages}
		totalItems={data.totalItems}
		status={data.status}
	/>
</div>
