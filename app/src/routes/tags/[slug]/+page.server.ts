import type { PostsResponseWithExpanded } from '$lib/types/pocketbase-expanded';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url, locals }) => {
  const { pb } = locals;

  // Get pagination parameters from URL
  const page = parseInt(url.searchParams.get('page') || '1');
  const perPage = parseInt(url.searchParams.get('perPage') || '10');

  try {
    // Find the tag by slug
    const tag = await pb.collection('tags').getFirstListItem(`slug = "${params.slug}"`);

    // Fetch paginated posts with this tag
    const result = await pb.collection('posts').getList<PostsResponseWithExpanded>(page, perPage, {
      filter: `tags.id ?= "${tag.id}" && published = true && visible = true`,
      sort: '-created',
      expand: 'author,tags',
    });

    return {
      tag,
      posts: result.items,
      pagination: {
        page: result.page,
        perPage: result.perPage,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
      },
    };
  } catch (err) {
    locals.logger
      .withContext({
        route: url.pathname,
        userId: locals.pb?.authStore?.record?.id,
        requestId: locals.requestId,
      })
      .withContext(err as Error)
      .error('Error loading tag or posts');
    throw error(404, 'Tag not found');
  }
};
