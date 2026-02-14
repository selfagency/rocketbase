<script lang="ts">
	import { page } from '$app/state';
	import PostList from '$lib/components/posts/PostList.svelte';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { getFileUrl } from '$lib/utils';
	import { MetaTags } from 'svelte-meta-tags';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const metaTags = $derived({
		title: `${data.author.name || data.author.email} - Authors`,
		description: `Posts by ${data.author.name || data.author.email}`,
		canonical: `${page.url.origin}/authors/${data.author.id}`,
		openGraph: {
			type: 'profile',
			url: `${page.url.origin}/authors/${data.author.id}`,
			title: data.author.name || data.author.email,
			description: `Posts by ${data.author.name || data.author.email}`,
			profile: {
				firstName: data.author.name?.split(' ')[0],
				lastName: data.author.name?.split(' ').slice(1).join(' '),
				username: data.author.username
			},
			images: data.author.avatar
				? [
						{
							url: `${page.url.origin}${getFileUrl('users', data.author.id, data.author.avatar)}`,
							alt: data.author.name || data.author.email
						}
					]
				: []
		},
		jsonLd: {
			'@context': 'https://schema.org',
			'@type': 'Person',
			name: data.author.name || data.author.email,
			description: data.author.bio,
			image: data.author.avatar
				? `${page.url.origin}${getFileUrl('users', data.author.id, data.author.avatar)}`
				: undefined,
			url: `${page.url.origin}/authors/${data.author.id}`,
			sameAs: data.author.website ? [data.author.website] : []
		}
	});

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

<MetaTags {...metaTags} />

<div class="container mx-auto px-4 py-12">
	<!-- Author Profile Header -->
	<div class="h-card mb-12 flex flex-col items-center text-center">
		<Avatar class="mb-6 h-32 w-32 border-4 border-background shadow-lg">
			{#if data.author.avatar}
				<AvatarImage
					src={getFileUrl('users', data.author.id, data.author.avatar)}
					alt={data.author.name || data.author.email}
					class="u-photo"
				/>
			{/if}
			<AvatarFallback class="text-3xl">
				{getAuthorInitials(data.author.name, data.author.email)}
			</AvatarFallback>
		</Avatar>
		<h1 class="p-name mb-2 text-4xl font-bold">{data.author.name || data.author.email}</h1>
		<data class="u-url hidden" value={`${page.url.origin}/authors/${data.author.id}`}></data>
		<data class="p-nickname hidden" value={data.author.username}></data>
		{#if data.author.title}
			<p class="p-job-title mb-4 text-xl text-muted-foreground">{data.author.title}</p>
		{/if}
		{#if data.author.bio}
			<div
				class="p-note prose mb-6 max-w-2xl text-lg text-muted-foreground dark:prose-invert"
			>
				{@html data.author.bio}
			</div>
		{/if}
		<div class="flex items-center gap-4">
			{#if data.author.website}
				<a
					href={data.author.website}
					class="u-url rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
					rel="me"
				>
					{new URL(data.author.website).hostname}
				</a>
			{/if}
			<div class="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
				{data.pagination.totalItems}
				{data.pagination.totalItems === 1 ? 'post' : 'posts'}
			</div>
		</div>
	</div>

	<hr class="mb-12" />

	<!-- Author Posts Grid -->
	<h2 class="mb-8 text-2xl font-bold italic">Posts by this author</h2>

	<PostList
		posts={data.posts}
		pagination={data.pagination}
		showAuthor={false}
		emptyTitle="No posts found"
		emptyDescription="This author hasn't published any posts yet."
	/>
</div>
