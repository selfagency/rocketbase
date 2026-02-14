<script lang="ts">
	import { page } from '$app/state';
	import PostHeader from '$lib/components/posts/PostHeader.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { getFileUrl } from '$lib/utils';
	import { MetaTags } from 'svelte-meta-tags';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const cdnUrl = $derived(data.metadata?.cdn_url);

	const metaTags = $derived({
		title: data.post.title,
		description: data.post.summary,
		canonical: `${page.url.origin}/posts/${data.post.slug}`,
		openGraph: {
			type: 'article',
			url: `${page.url.origin}/posts/${data.post.slug}`,
			title: data.post.title,
			description: data.post.summary,
			images: data.post.image
				? [
						{
							url: `${page.url.origin}${getFileUrl('posts', data.post.id, data.post.image, cdnUrl)}`,
							width: 1200,
							height: 630,
							alt: data.post.title
						}
					]
				: [],
			article: {
				publishedTime: data.post.date,
				modifiedTime: data.post.updated,
				authors: (data.post.expand as any)?.author?.map((a: any) => a.name || a.email) || [],
				tags: (data.post.expand as any)?.tags?.map((t: any) => t.name) || []
			}
		},
		twitter: {
			cardType: 'summary_large_image' as const,
			title: data.post.title,
			description: data.post.summary,
			image: data.post.image
				? `${page.url.origin}${getFileUrl('posts', data.post.id, data.post.image, cdnUrl)}`
				: undefined
		}
	});
</script>

<MetaTags {...metaTags} />

<div class="container mx-auto max-w-4xl px-4 py-8">
	<article class="prose prose-lg max-w-none">
		{#if data.post.title}
			<PostHeader post={data.post} {cdnUrl} />
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
