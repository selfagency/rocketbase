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

    const jsonFeed = {
      version: 'https://jsonfeed.org/version/1.1',
      title: siteTitle,
      home_page_url: baseUrl,
      feed_url: `${baseUrl}/feed/json`,
      description: siteDescription,
      items: posts.items.map(post => {
        const postUrl = `${baseUrl}/posts/${post.slug}`;
        return {
          id: postUrl,
          url: postUrl,
          title: post.title,
          content_text: post.summary || '',
          date_published: new Date(post.date || post.created).toISOString(),
          authors: (post.author as unknown as UsersResponse[])?.map(a => ({
            name: a.name || a.email,
            url: `${baseUrl}/authors/${a.id}`,
          })) || [{ name: 'Admin' }],
          tags: (post.tags as unknown as TagsResponse[])?.map(tag => tag.tag) || [],
        };
      }),
    };

    return new Response(JSON.stringify(jsonFeed), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=0, s-maxage=3600',
      },
    });
  } catch (err) {
    logger.withContext(err as Error).error('Error generating JSON feed');
    return new Response(JSON.stringify({ error: 'Error generating feed' }), { status: 500 });
  }
};
