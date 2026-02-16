<script lang="ts">
  import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
  import { Badge } from '$lib/components/ui/badge';
  import * as Card from '$lib/components/ui/card';
  import type { PostsResponseWithExpanded } from '$lib/types/pocketbase-expanded';
  import { getFileUrl } from '$lib/utils';
  import { format } from '@formkit/tempo';
  import UsersIcon from '@lucide/svelte/icons/users';

  interface Props {
    post: PostsResponseWithExpanded;
    cdnUrl?: string;
    showAuthor?: boolean;
  }

  let { post, cdnUrl, showAuthor = true }: Props = $props();

  function getAuthorInitials(name?: string, email?: string): string {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
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

<Card.Root class="interactive-lift surface-enter h-entry overflow-hidden transition-shadow hover:shadow-lg">
  {#if post.image}
    <div class="aspect-video overflow-hidden">
      <img
        src={getFileUrl('posts', post.id, post.image, cdnUrl)}
        alt={post.title}
        class="u-featured h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:scale-105 motion-reduce:transform-none"
        loading="lazy"
        decoding="async"
      />
    </div>
  {/if}
  <Card.Content class="p-6">
    <div class="mb-4">
      <h2 class="p-name mb-2 line-clamp-2 text-xl font-semibold">
        <a
          href={`/posts/${post.slug}`}
          class="u-url rounded-sm transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {post.title}
        </a>
      </h2>
      {#if post.summary}
        <p class="p-summary line-clamp-3 text-muted-foreground">{post.summary}</p>
      {/if}
    </div>

    {#if showAuthor}
      <div class="mb-4 flex items-center gap-3">
        <span class="sr-only">Authors:</span>
        <UsersIcon class="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        {#if post.author && post.author.length > 0}
          <div class="flex -space-x-2">
            {#each post.author as author, i}
              <a
                href={`/authors/${author.id}`}
                class="p-author u-category h-card rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                rel="author"
              >
                <Avatar class="h-8 w-8 border border-muted ring-2 ring-background" title={author.name || author.email}>
                  {#if author.avatar}
                    <AvatarImage
                      src={getFileUrl('users', author.id, author.avatar, cdnUrl)}
                      alt={author.name || author.email}
                      class="u-photo"
                    />
                  {/if}
                  <AvatarFallback class="text-xs">
                    {getAuthorInitials(author.name, author.email)}
                  </AvatarFallback>
                </Avatar>
                <data class="p-name hidden" value={author.name || author.email}></data>
                <data class="u-url hidden" value={`/authors/${author.id}`}></data>
              </a>
            {/each}
          </div>
          <div class="text-sm">
            <p class="font-medium">
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
            </p>
            <p class="text-muted-foreground">
              <time class="dt-published" datetime={post.date || post.created}>
                {format(post.date || post.created, 'MMMM D, YYYY')}
              </time>
            </p>
          </div>
        {:else}
          <div class="text-sm text-muted-foreground">
            <time class="dt-published" datetime={post.date || post.created}>
              {format(post.date || post.created, 'MMMM D, YYYY')}
            </time>
          </div>
        {/if}
      </div>
    {:else}
      <div class="mb-4 text-sm text-muted-foreground">
        <time class="dt-published" datetime={post.date || post.created}>
          {format(post.date || post.created, 'MMMM D, YYYY')}
        </time>
      </div>
    {/if}

    {#if post.tags && post.tags.length > 0}
      <div class="mt-4 flex flex-wrap gap-2">
        {#each post.tags as tag}
          <a
            href={`/tags/${tag.slug}`}
            class="rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <Badge variant="secondary" class="text-xs transition-colors hover:bg-primary hover:text-primary-foreground">
              #{tag.tag}
            </Badge>
          </a>
        {/each}
      </div>
    {/if}
  </Card.Content>
</Card.Root>
