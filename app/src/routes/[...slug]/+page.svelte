<script lang="ts">
	import PageContent from '$lib/components/PageContent.svelte';

	let { data } = $props();
</script>

{#if data.page}
	<PageContent page={data.page} />
{/if}
