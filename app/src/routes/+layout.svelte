<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import Nav from '$lib/components/global/Nav.svelte';
	import Toaster from '$lib/components/global/Toaster.svelte';
	import { setScreenSize } from '$lib/stores/screen';
	import type { Snippet } from 'svelte';
	import '../app.css';

	let { children, data }: { children: Snippet; data: { navItems?: any[] } } = $props();

	let innerWidth = $state(0);
	let innerHeight = $state(0);

	$effect(() => {
		if (innerWidth > 0) {
			setScreenSize(innerWidth, innerHeight);
		}
	});

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<Toaster />
<Nav navItems={data.navItems || []} />

<div
	class="container mx-auto flex min-h-[80vh] w-full max-w-5xl flex-col items-center justify-center"
>
	{@render children()}
</div>
