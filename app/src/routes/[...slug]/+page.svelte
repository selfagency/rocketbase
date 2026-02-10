<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.page?.title || 'Page'} | Rocketbase</title>
	{#if data.page?.summary}
		<meta name="description" content={data.page.summary} />
	{/if}
</svelte:head>

{#if data.page?.custom_css}
	<style>
		{data.page.custom_css}
	</style>
{/if}

{#if data.page}
	<div class="container mx-auto max-w-4xl px-4 py-8">
		<article class="prose prose-lg max-w-none">
			{#if data.page.title}
				<header class="mb-8">
					<h1 class="mb-4 text-3xl leading-tight font-bold">
						{data.page.title}
					</h1>
					{#if data.page.summary}
						<p class="text-xl leading-relaxed text-muted-foreground">
							{data.page.summary}
						</p>
					{/if}
					{#if data.page.image}
						<img
							src="{page.url.origin}/api/pb/files/pages/{data.page.id}/{data.page.image}"
							alt={data.page.title || 'Page image'}
							class="mt-6 h-64 w-full rounded-lg object-cover"
						/>
					{/if}
				</header>
			{/if}

			{#if data.page.content}
				<div class="content">
					{@html data.page.content}
				</div>
			{:else}
				<div class="py-12 text-center">
					<p class="text-lg text-muted-foreground">This page doesn't have any content yet.</p>
				</div>
			{/if}
		</article>

		{#if data.page.media && data.page.media.length > 0}
			<section class="mt-12">
				<h2 class="mb-6 text-2xl font-semibold">Media</h2>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each data.page.media as mediaFile}
						<div class="aspect-square">
							<img
								src="{page.url.origin}/api/pb/files/pages/{data.page.id}/{mediaFile}"
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
					<time datetime={data.page.updated}>
						Last updated: {new Date(data.page.updated).toLocaleDateString()}
					</time>
				</div>
				<Button href="/" variant="outline">Home</Button>
			</div>
		</footer>
	</div>
{/if}
