<script lang="ts">
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import type { PostsResponse } from '$lib/types/pocketbase';
	import { format } from '@formkit/tempo';

	interface Props {
		post: PostsResponse<{
			author: { id: string; name?: string; email: string; avatar?: string }[];
			tags: { id: string; tag: string; slug: string }[];
		}>;
	}

	let { post }: Props = $props();

	function getAuthorInitials(name?: string, email?: string): string {
		if (name) {
			return name
				.split(' ')
				.map((n) => n[0])
				.join('')
				.toUpperCase()
				.slice(0, 2);
		}
		if (email) {
			return email[0].toUpperCase();
		}
		return 'U';
	}
</script>

<Card.Root class="overflow-hidden transition-shadow hover:shadow-lg">
	{#if post.image}
		<div class="aspect-video overflow-hidden">
			<img
				src={`/api/pb/_superusers/files/${post.collectionId}/${post.id}/${post.image}`}
				alt={post.title}
				class="h-full w-full object-cover transition-transform hover:scale-105"
			/>
		</div>
	{/if}
	<Card.Content class="p-6">
		<div class="mb-4">
			<h2 class="mb-2 line-clamp-2 text-xl font-semibold">
				<a href={`/posts/${post.slug}`} class="transition-colors hover:text-primary">
					{post.title}
				</a>
			</h2>
			{#if post.summary}
				<p class="line-clamp-3 text-muted-foreground">{post.summary}</p>
			{/if}
		</div>

		<div class="mb-4 flex items-center gap-3">
			{#if post.expand?.author && post.expand.author.length > 0}
				{@const author = post.expand.author[0]}
				<Avatar class="h-8 w-8">
					{#if author.avatar}
						<AvatarImage
							src={`/api/pb/files/users/${author.id}/${author.avatar}`}
							alt={author.name || author.email}
						/>
					{/if}
					<AvatarFallback class="text-xs">
						{getAuthorInitials(author.name, author.email)}
					</AvatarFallback>
				</Avatar>
				<div class="text-sm">
					<p class="font-medium">{author.name || author.email}</p>
					<p class="text-muted-foreground">
						{format(post.date || post.created, 'MMMM D, YYYY')}
					</p>
				</div>
			{:else}
				<div class="text-sm text-muted-foreground">
					{format(post.date || post.created, 'MMMM D, YYYY')}
				</div>
			{/if}
		</div>

		{#if post.expand?.tags && post.expand.tags.length > 0}
			<div class="flex flex-wrap gap-2">
				{#each post.expand.tags as tag}
					<a href={`/tags/${tag.slug}`}>
						<Badge variant="secondary" class="text-xs transition-colors hover:bg-primary hover:text-primary-foreground">
							#{tag.tag}
						</Badge>
					</a>
				{/each}
			</div>
		{/if}
	</Card.Content>
</Card.Root>
