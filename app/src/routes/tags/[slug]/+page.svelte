<script lang="ts">
	import { page } from '$app/state';
	import { Badge } from '$lib/components/ui/badge';
	import PostList from '$lib/components/posts/PostList.svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const metaTags = $derived({
		title: `#${data.tag.tag}`,
		description: `Posts tagged with ${data.tag.tag}`,
		canonical: `${page.url.origin}/tags/${data.tag.slug}`,
		openGraph: {
			type: 'website',
			url: `${page.url.origin}/tags/${data.tag.slug}`,
			title: `#${data.tag.tag}`,
			description: `Posts tagged with ${data.tag.tag}`
		}
	});
</script>

<MetaTags {...metaTags} />

<div class="container mx-auto px-4 py-8">
	<div class="mb-8">
		<div class="mb-4 flex items-center gap-2">
			<h1 class="text-4xl font-bold tracking-tight">
				<Badge variant="secondary" class="text-2xl">
					#{data.tag.tag}
				</Badge>
			</h1>
		</div>
		{#if data.pagination.totalItems > 0}
			<p class="text-muted-foreground">
				{data.pagination.totalItems}
				{data.pagination.totalItems === 1 ? 'post' : 'posts'}
			</p>
		{/if}
	</div>

	<PostList
		posts={data.posts}
		pagination={data.pagination}
		emptyTitle="No posts found"
		emptyDescription="There are no posts with this tag."
	/>
</div>
