<script lang="ts">
	import { page } from '$app/state';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
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
			<header class="mb-8">
				<h1 class="mb-4 text-3xl leading-tight font-bold">
					{data.post.title}
				</h1>

				{#if data.post.summary}
					<p class="mb-4 text-xl leading-relaxed text-muted-foreground">
						{data.post.summary}
					</p>
				{/if}

				{#if data.post.image}
					<img
						src="{page.url.origin}/api/pb/files/posts/{data.post.id}/{data.post.image}"
						alt={data.post.title}
						class="mt-6 mb-6 h-64 w-full rounded-lg object-cover"
					/>
				{/if}

				<div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
					{#if data.post.expand?.author && data.post.expand.author.length > 0}
						{@const author = data.post.expand.author[0]}
						<div class="flex items-center gap-2">
							<Avatar class="h-6 w-6">
								{#if author.avatar}
									<AvatarImage
										src="{page.url.origin}/api/pb/files/users/{author.id}/{author.avatar}"
										alt={author.name || author.email}
									/>
								{/if}
								<AvatarFallback class="text-xs">
									{(author.name || author.email || 'U').charAt(0).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<span>{author.name || author.email}</span>
						</div>
					{/if}

					{#if data.post.date}
						<time datetime={data.post.date}>
							{new Date(data.post.date).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							})}
						</time>
					{/if}

					{#if data.post.expand?.tags && data.post.expand.tags.length > 0}
						<div class="flex flex-wrap gap-1">
							{#each data.post.expand.tags as tag}
								<Badge variant="secondary" class="text-xs">
									{tag.tag}
								</Badge>
							{/each}
						</div>
					{/if}
				</div>
			</header>
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
