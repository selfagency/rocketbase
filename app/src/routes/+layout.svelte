<script lang="ts">
	import Nav from '$lib/components/global/Nav.svelte';
	import Toaster from '$lib/components/global/Toaster.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<Toaster />
<Nav />

<div class="container mx-auto p-8 pt-24">
	{@render children()}
</div>
