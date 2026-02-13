<script lang="ts">
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import type { PagesResponse } from '$lib/types/pocketbase';
	import { enhance } from '$app/forms';

	let { page }: { page: PagesResponse } = $props();

	let deleteFormElement: HTMLFormElement | undefined = $state();
	let isDeleting = $state(false);

	function handleDelete() {
		if (confirm(`Are you sure you want to delete "${page.title || 'this page'}"?`)) {
			isDeleting = true;
			deleteFormElement?.requestSubmit();
		}
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
				<span class="sr-only">Open menu</span>
				<EllipsisIcon class="size-4" />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Group>
			<DropdownMenu.Label>Actions</DropdownMenu.Label>
			<DropdownMenu.Item onclick={() => window.location.href = `/admin/pages/${page.id}`}>
				Edit page
			</DropdownMenu.Item>
			<DropdownMenu.Item onclick={() => window.open(`/${page.slug}`, '_blank')}>
				View page
			</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item
			onclick={handleDelete}
			class="text-destructive focus:text-destructive"
			disabled={isDeleting}
		>
			{isDeleting ? 'Deleting...' : 'Delete page'}
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<!-- Hidden form for delete action -->
<form bind:this={deleteFormElement} method="POST" action="?/delete" use:enhance class="hidden">
	<input type="hidden" name="id" value={page.id} />
</form>
