<script lang="ts">
  import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
  import { Badge } from '$lib/components/ui/badge';
  import type { PostsResponseWithExpanded } from '$lib/types/pocketbase-expanded';
  import { getFileUrl } from '$lib/utils';
  import LinkIcon from '@lucide/svelte/icons/link';
  import UsersIcon from '@lucide/svelte/icons/users';

  interface Props {
    post: PostsResponseWithExpanded;
    cdnUrl?: string;
  }

  let { post, cdnUrl }: Props = $props();
</script>

<header class="mb-8 font-sans">
  <h1 class="p-name group mb-4 flex items-center gap-2 text-3xl leading-tight font-bold">
    {post.title}
    <a
      href={`/posts/${post.slug}`}
      class="u-url u-uid rounded-sm opacity-0 transition-opacity group-hover:opacity-100 hover:text-primary focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
      aria-label="Permalink"
    >
      <LinkIcon class="h-6 w-6" />
    </a>
  </h1>

  {#if post.summary}
    <p class="p-summary mb-4 text-xl leading-relaxed text-muted-foreground">
      {post.summary}
    </p>
  {/if}

  {#if post.image}
    <img
      src={getFileUrl('posts', post.id, post.image, cdnUrl)}
      alt={post.title}
      class="u-featured mt-6 mb-6 h-64 w-full rounded-lg object-cover"
      loading="eager"
      decoding="async"
    />
  {/if}

  <div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
    {#if post.author && post.author.length > 0}
      <div class="flex items-center gap-2">
        <span class="sr-only">Authors:</span>
        <UsersIcon class="h-4 w-4" aria-hidden="true" />
        <div class="flex -space-x-2">
          {#each post.author as author}
            <a
              href={`/authors/${author.id}`}
              class="p-author u-category h-card rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
              rel="author"
            >
              <Avatar class="h-6 w-6 border border-muted ring-2 ring-background" title={author.name || author.email}>
                {#if author.avatar}
                  <AvatarImage
                    src={getFileUrl('users', author.id, author.avatar, cdnUrl)}
                    alt={author.name || author.email}
                    class="u-photo"
                  />
                {/if}
                <AvatarFallback class="text-xs">
                  {(author.name || author.email || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <data class="p-name hidden" value={author.name || author.email}></data>
              <data class="u-url hidden" value={`/authors/${author.id}`}></data>
            </a>
          {/each}
        </div>
        <span>
          {#each post.author as author, i}
            <a
              href={`/authors/${author.id}`}
              class="p-author u-category h-card rounded-sm transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
              rel="author"
            >
              <span class="p-name">{author.name || author.email}</span>
              <data class="u-url hidden" value={`/authors/${author.id}`}></data>
            </a>
            {i < post.author.length - 1 ? ', ' : ''}
          {/each}
        </span>
      </div>
    {/if}

    {#if post.date}
      <a
        href={`/posts/${post.slug}`}
        class="u-url rounded-sm transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <time class="dt-published" datetime={post.date}>
          {new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
      </a>
    {/if}

    {#if post.tags && post.tags.length > 0}
      <div class="mt-4 flex flex-wrap gap-2">
        {#each post.tags as tag}
          <a
            href={`/tags/${tag.slug}`}
            class="p-category rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
            rel="tag"
          >
            <Badge variant="secondary" class="text-xs transition-colors hover:bg-primary hover:text-primary-foreground">
              #{tag.tag}
            </Badge>
          </a>
        {/each}
      </div>
    {/if}
  </div>
</header>
