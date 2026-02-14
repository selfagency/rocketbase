<script lang="ts">
	import PageForm from '../page-form.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="container mx-auto max-w-4xl py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold">Edit Page</h1>
		<p class="mt-2 text-muted-foreground">Update "{data.page.title || 'Untitled'}"</p>
	</div>

	<PageForm {data} isEdit={true} parentSlug={data.parentSlug} />
</div>
