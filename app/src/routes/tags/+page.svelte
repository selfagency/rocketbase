<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Tags | Rocketbase</title>
	<meta name="description" content="Browse all post tags" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8">
		<h1 class="mb-4 text-4xl font-bold tracking-tight">Tags</h1>
		{#if data.tags.length > 0}
			<p class="text-muted-foreground">
				Browse posts by tag ({data.tags.length}
				{data.tags.length === 1 ? 'tag' : 'tags'})
			</p>
		{/if}
	</div>

	{#if data.tags.length === 0}
		<div class="py-12 text-center">
			<h2 class="mb-2 text-2xl font-semibold">No tags found</h2>
			<p class="text-muted-foreground">There are no tags to display.</p>
		</div>
	{:else}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each data.tags as tag (tag.id)}
				<a href={`/tags/${tag.slug}`}>
					<Card.Root class="transition-all hover:border-primary hover:shadow-md">
						<Card.Content class="p-6">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<Badge variant="secondary" class="text-lg">
										#{tag.tag}
									</Badge>
								</div>
								<div class="text-sm text-muted-foreground">
									{tag.postCount}
									{tag.postCount === 1 ? 'post' : 'posts'}
								</div>
							</div>
						</Card.Content>
					</Card.Root>
				</a>
			{/each}
		</div>
	{/if}
</div>
