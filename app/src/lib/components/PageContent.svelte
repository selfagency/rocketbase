<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import type { PagesResponse } from '$lib/types/pocketbase';
	import { MetaTags } from 'svelte-meta-tags';

	let { page: pageData }: { page: PagesResponse } = $props();

	const metaTags = $derived({
		title: pageData.title || 'Page',
		description: pageData.summary,
		canonical: `${page.url.origin}/${pageData.slug}`,
		openGraph: {
			type: 'website',
			url: `${page.url.origin}/${pageData.slug}`,
			title: pageData.title || 'Page',
			description: pageData.summary,
			images: pageData.image
				? [
						{
							url: `${page.url.origin}/api/pb/files/pages/${pageData.id}/${pageData.image}`,
							width: 1200,
							height: 630,
							alt: pageData.title || 'Page'
						}
					]
				: []
		}
	});
</script>

<MetaTags {...metaTags} />

{#if pageData.custom_css}
	{@html `<style>${pageData.custom_css}</style>`}
{/if}

<div class="container mx-auto max-w-4xl px-4 py-8">
	<article class="prose prose-lg max-w-none">
		{#if pageData.title}
			<header class="mb-8">
				<h1 class="mb-4 text-3xl leading-tight font-bold">
					{pageData.title}
				</h1>
				{#if pageData.summary}
					<p class="text-xl leading-relaxed text-muted-foreground">
						{pageData.summary}
					</p>
				{/if}
				{#if pageData.image}
					<img
						src="{page.url.origin}/api/pb/files/pages/{pageData.id}/{pageData.image}"
						alt={pageData.title || 'Page image'}
						class="mt-6 h-64 w-full rounded-lg object-cover"
					/>
				{/if}
			</header>
		{/if}

		{#if pageData.content}
			<div class="content">
				{@html pageData.content}
			</div>
		{:else}
			<div class="py-12 text-center">
				<p class="text-lg text-muted-foreground">This page doesn't have any content yet.</p>
			</div>
		{/if}
	</article>

	{#if pageData.media && pageData.media.length > 0}
		<section class="mt-12">
			<h2 class="mb-6 text-2xl font-semibold">Media</h2>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each pageData.media as mediaFile}
					<div class="aspect-square">
						<img
							src="{page.url.origin}/api/pb/files/pages/{pageData.id}/{mediaFile}"
							alt="Media file"
							class="h-full w-full rounded-lg object-cover"
						/>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<footer class="mt-12 border-t pt-8">
		<div class="flex items-center justify-between">
			<div class="text-sm text-muted-foreground">
				<time datetime={pageData.updated}>
					Last updated: {new Date(pageData.updated).toLocaleDateString()}
				</time>
			</div>
			<Button href="/" variant="outline">Home</Button>
		</div>
	</footer>
</div>
