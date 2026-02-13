<script lang="ts">
	import { page } from '$app/state';
	import PostHeader from '$lib/components/posts/PostHeader.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.post.title} | Rocketbase</title>
	{#if data.post.summary}
		<meta name="description" content={data.post.summary} />
	{/if}
	{#if data.post.image}
		<meta
			property="og:image"
			content="{page.url.origin}/api/pb/files/posts/{data.post.id}/{data.post.image}"
		/>
	{/if}
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-8">
	<article class="prose prose-lg max-w-none">
		{#if data.post.title}
			<PostHeader post={data.post} />
		{/if}

		{#if data.post.content}
			<div class="content">
				{@html data.post.content}
			</div>
		{:else}
			<div class="py-12 text-center">
				<p class="text-lg text-muted-foreground">{m['post.no_content']()}</p>
			</div>
		{/if}
	</article>
</div>
