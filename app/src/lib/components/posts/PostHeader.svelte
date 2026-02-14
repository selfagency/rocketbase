<script lang="ts">
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import type { PostsResponseWithExpanded } from '$lib/types/pocketbase-expanded';
	import { getFileUrl } from '$lib/utils';
	import LinkIcon from '@lucide/svelte/icons/link';

	interface Props {
		post: PostsResponseWithExpanded;
		cdnUrl?: string;
	}

	let { post, cdnUrl }: Props = $props();
</script>

<header class="mb-8">
	<h1 class="group mb-4 flex items-center gap-2 text-3xl leading-tight font-bold">
		{post.title}
		<a
			href={`/posts/${post.slug}`}
			class="opacity-0 transition-opacity hover:text-primary group-hover:opacity-100"
			aria-label="Permalink"
		>
			<LinkIcon class="h-6 w-6" />
		</a>
	</h1>

	{#if post.summary}
		<p class="mb-4 text-xl leading-relaxed text-muted-foreground">
			{post.summary}
		</p>
	{/if}

	{#if post.image}
		<img
			src={getFileUrl('posts', post.id, post.image, cdnUrl)}
			alt={post.title}
			class="mt-6 mb-6 h-64 w-full rounded-lg object-cover"
		/>
	{/if}

	<div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
		{#if post.author && post.author.length > 0}
			<div class="flex items-center gap-2">
				<div class="flex -space-x-2">
					{#each post.author as author}
						<a href={`/authors/${author.id}`}>
							<Avatar
								class="h-6 w-6 border border-muted ring-2 ring-background"
								title={author.name || author.email}
							>
								{#if author.avatar}
									<AvatarImage
										src={getFileUrl('users', author.id, author.avatar, cdnUrl)}
										alt={author.name || author.email}
									/>
								{/if}
								<AvatarFallback class="text-xs">
									{(author.name || author.email || 'U').charAt(0).toUpperCase()}
								</AvatarFallback>
							</Avatar>
						</a>
					{/each}
				</div>
				<span>
					{#each post.author as author, i}
						<a href={`/authors/${author.id}`} class="transition-colors hover:text-primary">
							{author.name || author.email}
						</a>
						{i < post.author.length - 1 ? ', ' : ''}
					{/each}
				</span>
			</div>
		{/if}

		{#if post.date}
			<a href={`/posts/${post.slug}`} class="transition-colors hover:text-primary">
				<time datetime={post.date}>
					{new Date(post.date).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}
				</time>
			</a>
		{/if}

		{#if post.tags && post.tags.length > 0}
			<div class="mt-4 flex flex-wrap gap-2">
				{#each post.tags as tag}
					<a href={`/tags/${tag.slug}`}>
						<Badge
							variant="secondary"
							class="text-xs transition-colors hover:bg-primary hover:text-primary-foreground"
						>
							#{tag.tag}
						</Badge>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</header>
