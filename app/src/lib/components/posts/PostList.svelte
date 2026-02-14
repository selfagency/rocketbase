<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import * as Pagination from '$lib/components/ui/pagination';
	import type { PostsResponseWithExpanded } from '$lib/types/pocketbase-expanded';
	import PostCard from './PostCard.svelte';

	interface Props {
		posts: PostsResponseWithExpanded[];
		pagination: {
			page: number;
			perPage: number;
			totalItems: number;
			totalPages: number;
		};
		emptyTitle?: string;
		emptyDescription?: string;
	}

	let {
		posts,
		pagination,
		emptyTitle = 'No posts found',
		emptyDescription = 'There are no posts to display.'
	}: Props = $props();

	function handlePageChange(pageNum: number) {
		const url = new URL(page.url);
		url.searchParams.set('page', pageNum.toString());
		goto(url.toString(), { replaceState: true });
	}
</script>

{#if posts.length === 0}
	<div class="py-12 text-center">
		<h2 class="mb-2 text-2xl font-semibold">{emptyTitle}</h2>
		<p class="text-muted-foreground">{emptyDescription}</p>
	</div>
{:else}
	<div class="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each posts as post (post.id)}
			<PostCard {post} />
		{/each}
	</div>

	{#if pagination.totalPages > 1}
		<Pagination.Root
			count={pagination.totalItems}
			perPage={pagination.perPage}
			page={pagination.page}
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
								<Pagination.Link {page} isActive={currentPage === page.value}>
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
