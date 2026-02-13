<script lang="ts">
	import { page } from '$app/state';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import type { PostsResponse } from '$lib/types/pocketbase';

	interface Props {
		post: PostsResponse<{
			author: { id: string; name?: string; email: string; avatar?: string }[];
			tags: { id: string; tag: string; slug: string }[];
		}>;
	}

	let { post }: Props = $props();
</script>

<header class="mb-8">
	<h1 class="mb-4 text-3xl leading-tight font-bold">
		{post.title}
	</h1>

	{#if post.summary}
		<p class="mb-4 text-xl leading-relaxed text-muted-foreground">
			{post.summary}
		</p>
	{/if}

	{#if post.image}
		<img
			src="{page.url.origin}/api/pb/files/posts/{post.id}/{post.image}"
			alt={post.title}
			class="mt-6 mb-6 h-64 w-full rounded-lg object-cover"
		/>
	{/if}

	<div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
		{#if post.expand?.author && post.expand.author.length > 0}
			{@const author = post.expand.author[0]}
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

		{#if post.date}
			<time datetime={post.date}>
				{new Date(post.date).toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})}
			</time>
		{/if}

		{#if post.expand?.tags && post.expand.tags.length > 0}
			<div class="flex flex-wrap gap-1">
				{#each post.expand.tags as tag}
					<a href={`/tags/${tag.slug}`}>
						<Badge variant="secondary" class="text-xs transition-colors hover:bg-primary hover:text-primary-foreground">
							#{tag.tag}
						</Badge>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</header>
