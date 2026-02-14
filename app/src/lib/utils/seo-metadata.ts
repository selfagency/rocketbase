/**
 * SEO metadata generation utilities for pages and posts
 */

import { getFileUrl } from '$lib/utils';
import type { PostsResponseWithExpanded } from '$lib/types/pocketbase-expanded';
import type { MetaTagsProps } from 'svelte-meta-tags';

export interface GeneratePostMetaTagsOptions {
  post: PostsResponseWithExpanded;
  origin: string;
  cdnUrl?: string;
  siteName?: string;
  ogImage?: string;
}

/**
 * Generate complete meta tags for a blog post including OpenGraph and JSON-LD structured data
 */
export function generatePostMetaTags(options: GeneratePostMetaTagsOptions): MetaTagsProps & { jsonLd?: any } {
  const { post, origin, cdnUrl, siteName = 'Rocketbase', ogImage } = options;

  const canonical = `${origin}/posts/${post.slug}`;
  const imageUrl = post.image ? `${origin}${getFileUrl('posts', post.id, post.image, cdnUrl)}` : undefined;

  // Extract author and tag data from expanded relations
  const authors = (post.expand as any)?.author || [];
  const tags = (post.expand as any)?.tags || [];

  return {
    title: post.title,
    description: post.summary,
    canonical,
    openGraph: {
      type: 'article',
      url: canonical,
      title: post.title,
      description: post.summary,
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
      article: {
        publishedTime: post.date,
        modifiedTime: post.updated,
        authors: authors.map((a: any) => a.name || a.email),
        tags: tags.map((t: any) => t.name),
      },
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.summary,
      image: imageUrl,
      datePublished: post.date,
      dateModified: post.updated,
      author: authors.map((a: any) => ({
        '@type': 'Person',
        name: a.name || a.email,
        url: `${origin}/authors/${a.id}`,
      })),
      publisher: {
        '@type': 'Organization',
        name: siteName,
        logo: ogImage
          ? {
              '@type': 'ImageObject',
              url: ogImage,
            }
          : undefined,
      },
    },
  };
}
