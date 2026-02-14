<script lang="ts">
  import { page } from '$app/state';
  import PostHeader from '$lib/components/posts/PostHeader.svelte';
  import * as m from '$lib/paraglide/messages';
  import { getFileUrl } from '$lib/utils';
  import { MetaTags } from 'svelte-meta-tags';

  let { data } = $props();

  const cdnUrl = $derived(data.metadata?.cdn_url);
  const featuredImageUrl = $derived(
    data.post.image ? `${page.url.origin}${getFileUrl('posts', data.post.id, data.post.image, cdnUrl)}` : undefined
  );

  const metaTags = $derived({
    title: `${data.post.title} (Preview)`,
    description: data.post.summary,
    canonical: page.url.href,
    robots: 'noindex,nofollow',
    openGraph: {
      type: 'article',
      url: page.url.href,
      title: `${data.post.title} (Preview)`,
      description: data.post.summary,
      images: featuredImageUrl
        ? [
            {
              url: featuredImageUrl,
              width: 1200,
              height: 630,
              alt: data.post.title,
            },
          ]
        : [],
      article: {
        publishedTime: data.post.date,
        modifiedTime: data.post.updated,
        authors: (data.post.expand as any)?.author?.map((a: any) => a.name || a.email) || [],
        tags: (data.post.expand as any)?.tags?.map((t: any) => t.name) || [],
      },
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: data.post.title,
      description: data.post.summary,
      image: featuredImageUrl,
      datePublished: data.post.date,
      dateModified: data.post.updated,
      author: (data.post.expand as any)?.author?.map((a: any) => ({
        '@type': 'Person',
        name: a.name || a.email,
        url: `${page.url.origin}/authors/${a.id}`,
      })),
      publisher: {
        '@type': 'Organization',
        name: data.metadata?.site_title || 'Rocketbase',
        logo: data.metadata?.og_image
          ? {
              '@type': 'ImageObject',
              url: data.metadata.og_image,
            }
          : undefined,
      },
    },
  });
</script>

<MetaTags {...metaTags} />

<div class="container mx-auto max-w-4xl px-4 py-8">
  <p
    class="mb-6 rounded-md border border-dashed border-amber-500/70 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:bg-amber-900/20 dark:text-amber-100"
  >
    This is a preview of an unpublished draft.
  </p>

  <article class="h-entry prose prose-lg max-w-none">
    {#if data.post.title}
      <PostHeader post={data.post} {cdnUrl} />
    {/if}

    {#if data.post.content}
      <div class="e-content content">
        {@html data.post.content}
      </div>
    {:else}
      <div class="py-12 text-center">
        <p class="text-lg text-muted-foreground">{m['post.no_content']()}</p>
      </div>
    {/if}
  </article>
</div>
