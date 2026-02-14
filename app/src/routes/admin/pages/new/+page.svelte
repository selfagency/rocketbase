<script lang="ts">
	import PageForm from '../page-form.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="container mx-auto max-w-4xl py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold">Create Page</h1>
		<p class="mt-2 text-muted-foreground">Add a new page to your site.</p>
	</div>

	<PageForm {data} isEdit={false} />
</div>
