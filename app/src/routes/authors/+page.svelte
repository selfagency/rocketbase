<script lang="ts">
  import { page } from '$app/state';
  import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
  import * as Card from '$lib/components/ui/card';
  import { getFileUrl } from '$lib/utils';
  import { MetaTags } from 'svelte-meta-tags';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const metaTags = $derived({
    title: 'Authors',
    description: 'Browse all post authors',
    canonical: `${page.url.origin}/authors`,
    openGraph: {
      type: 'website',
      url: `${page.url.origin}/authors`,
      title: 'Authors',
      description: 'Browse all post authors',
    },
  });

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

<MetaTags {...metaTags} />

<div class="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
  <div class="mb-8">
    <h1 class="mb-4 text-4xl font-bold tracking-tight">Authors</h1>
    {#if data.authors.length > 0}
      <p class="text-muted-foreground">
        Browse posts by author ({data.authors.length}
        {data.authors.length === 1 ? 'author' : 'authors'})
      </p>
    {/if}
  </div>

  {#if data.authors.length === 0}
    <div class="py-12 text-center">
      <h2 class="mb-2 text-2xl font-semibold">No authors found</h2>
      <p class="text-muted-foreground">There are no authors to display.</p>
    </div>
  {:else}
    <div class="h-feed grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {#each data.authors as author (author.id)}
        <a href={`/authors/${author.id}`} class="h-card u-url">
          <Card.Root class="interactive-lift surface-enter h-full transition-all hover:border-primary hover:shadow-md">
            <Card.Content class="flex flex-col items-center p-6 text-center">
              <Avatar class="mb-4 h-20 w-20">
                {#if author.avatar}
                  <AvatarImage
                    src={getFileUrl('users', author.id, author.avatar)}
                    alt={author.name || author.email}
                    class="u-photo"
                  />
                {/if}
                <AvatarFallback class="text-xl">
                  {getAuthorInitials(author.name, author.email)}
                </AvatarFallback>
              </Avatar>
              <h2 class="p-name mb-1 text-xl font-semibold">{author.name || author.email}</h2>
              {#if author.title}
                <p class="p-job-title mb-4 text-sm text-muted-foreground">{author.title}</p>
              {/if}
              <div class="mt-auto text-sm font-medium text-primary">
                {author.postCount}
                {author.postCount === 1 ? 'post' : 'posts'}
              </div>
            </Card.Content>
          </Card.Root>
        </a>
      {/each}
    </div>
  {/if}
</div>
