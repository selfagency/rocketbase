<script lang="ts">
	import { page } from '$app/state';
	import PostList from '$lib/components/posts/PostList.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { MetaTags } from 'svelte-meta-tags';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const metaTags = $derived({
		title: m.posts_title(),
		description: m.posts_description(),
		canonical: `${page.url.origin}/posts`,
		openGraph: {
			type: 'website',
			url: `${page.url.origin}/posts`,
			title: m.posts_title(),
			description: m.posts_description()
		}
	});
</script>

<MetaTags {...metaTags} />

<div class="container mx-auto px-4 py-8">
	<div class="mb-8">
		<h1 class="mb-4 text-4xl font-bold tracking-tight">{m.posts_title()}</h1>
		{#if data.pagination.totalItems > 0}
			<p class="text-muted-foreground">
				{m.posts_count({ count: data.pagination.totalItems })}
			</p>
		{/if}
	</div>

	<PostList
		posts={data.posts}
		pagination={data.pagination}
		emptyTitle={m.posts_empty_title()}
		emptyDescription={m.posts_empty_description()}
	/>
</div>
