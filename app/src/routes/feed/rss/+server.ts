import type { TagsResponse, UsersResponse } from '$lib/types/pocketbase';
import type { PostsResponseWithExpanded } from '$lib/types/pocketbase-expanded';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url }) => {
  const { pb, logger } = locals;

  try {
    // Fetch latest 20 posts for the feed
    const posts = await pb.collection('posts').getList<PostsResponseWithExpanded>(1, 20, {
      filter: 'published = true && visible = true',
      sort: '-date',
      expand: 'author,tags',
    });

    const siteTitle = 'Rocketbase';
    const siteDescription = 'A production-ready full-stack application';
    const baseUrl = url.origin;

    const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/1999/xlink">
<channel>
	<title>${siteTitle}</title>
	<description>${siteDescription}</description>
	<link>${baseUrl}</link>
	<atom:link href="${baseUrl}/feed/rss" rel="self" type="application/rss+xml" />
	<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
	${posts.items
    .map(post => {
      const postUrl = `${baseUrl}/posts/${post.slug}`;
      const authorNames =
        (post.author as unknown as UsersResponse[])?.map(a => a.name || a.email).join(', ') || 'Admin';
      return `
	<item>
		<title>${post.title}</title>
		<link>${postUrl}</link>
		<guid isPermaLink="true">${postUrl}</guid>
		<pubDate>${new Date(post.date || post.created).toUTCString()}</pubDate>
		<description><![CDATA[${post.summary || ''}]]></description>
		<author>${authorNames}</author>
		${(post.tags as unknown as TagsResponse[])?.map(tag => `<category>${tag.tag}</category>`).join('') || ''}
	</item>`;
    })
    .join('')}
</channel>
</rss>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'max-age=0, s-maxage=3600',
      },
    });
  } catch (err) {
    logger.withContext(err as Error).error('Error generating RSS feed');
    return new Response('Error generating feed', { status: 500 });
  }
};
