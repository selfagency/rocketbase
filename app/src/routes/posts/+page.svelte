<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import type { PageData } from './$types';
	import { format } from '@formkit/tempo';
	import * as m from '$lib/paraglide/messages.js';

	let { data }: { data: PageData } = $props();

	function handlePageChange(pageNum: number) {
		const url = new URL(page.url);
		url.searchParams.set('page', pageNum.toString());
		goto(url.toString(), { replaceState: true });
	}

	function getAuthorInitials(name?: string, email?: string): string {
		if (name) {
			return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
		}
		if (email) {
			return email[0].toUpperCase();
		}
		return 'U';
	}
</script>

<svelte:head>
	<title>{m.posts_title()}</title>
	<meta name="description" content={m.posts_description()} />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8">
		<h1 class="text-4xl font-bold tracking-tight mb-4">{m.posts_title()}</h1>
		{#if data.pagination.totalItems > 0}
			<p class="text-muted-foreground">
				{m.posts_count({ count: data.pagination.totalItems })}
			</p>
		{/if}
	</div>

	{#if data.posts.length === 0}
		<div class="text-center py-12">
			<h2 class="text-2xl font-semibold mb-2">{m.posts_empty_title()}</h2>
			<p class="text-muted-foreground">{m.posts_empty_description()}</p>
		</div>
	{:else}
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
			{#each data.posts as post}
				<Card.Root class="overflow-hidden hover:shadow-lg transition-shadow">
					{#if post.image}
						<div class="aspect-video overflow-hidden">
							<img
								src={`/api/pb/_superusers/files/${post.collectionId}/${post.id}/${post.image}`}
								alt={post.title}
								class="w-full h-full object-cover hover:scale-105 transition-transform"
							/>
						</div>
					{/if}
					<Card.Content class="p-6">
						<div class="mb-4">
							<h2 class="text-xl font-semibold mb-2 line-clamp-2">
								<a
									href={`/posts/${post.slug}`}
									class="hover:text-primary transition-colors"
								>
									{post.title}
								</a>
							</h2>
							{#if post.summary}
								<p class="text-muted-foreground line-clamp-3">{post.summary}</p>
							{/if}
						</div>

						<div class="flex items-center gap-3 mb-4">
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
									<Badge variant="secondary" class="text-xs">
										{tag.tag}
									</Badge>
								{/each}
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			{/each}
		</div>

		{#if data.pagination.totalPages > 1}
			<Pagination.Root
				count={data.pagination.totalItems}
				perPage={data.pagination.perPage}
				page={data.pagination.page}
				onPageChange={handlePageChange}
			>
				{#snippet children({ pages, currentPage })}
					<Pagination.Content>
						<Pagination.Item>
							<Pagination.Previous />
						</Pagination.Item>
						{#each pages as page (page.key)}
							{#if page.type === 'ellipsis'}
								<Pagination.Item>
									<Pagination.Ellipsis />
								</Pagination.Item>
							{:else}
								<Pagination.Item>
									<Pagination.Link
										{page}
										isActive={currentPage === page.value}
									>
										{page.value}
									</Pagination.Link>
								</Pagination.Item>
							{/if}
						{/each}
						<Pagination.Item>
							<Pagination.Next />
						</Pagination.Item>
					</Pagination.Content>
				{/snippet}
			</Pagination.Root>
		{/if}
	{/if}
</div>