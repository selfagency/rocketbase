import { error } from '@sveltejs/kit';
import { getServerPageSizes } from '$lib/server/page-size-store';
import type { PostsResponseWithExpanded } from '$lib/types/pocketbase-expanded';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
  const { pb } = locals;
  const { id } = params;
  const { postsPerPage } = await getServerPageSizes(pb);
  const page = Number(url.searchParams.get('page')) || 1;
  const perPage = Number(url.searchParams.get('perPage')) || postsPerPage;

  try {
    // Fetch author details
    const author = await pb.collection('users').getOne(id);

    // Fetch posts by this author
    const postsList = await pb.collection('posts').getList<PostsResponseWithExpanded>(page, perPage, {
      filter: `author.id ?= "${id}" && published = true && visible = true`,
      sort: '-created',
      expand: 'author,tags',
    });

    return {
      author,
      posts: postsList.items,
      pagination: {
        page,
        perPage,
        totalItems: postsList.totalItems,
        totalPages: postsList.totalPages,
      },
    };
  } catch (err: any) {
    console.error('Error loading author page:', err);
    if (err.status === 404) {
      error(404, {
        message: 'Author not found',
      });
    }
    error(500, {
      message: 'An error occurred while loading the author page',
    });
  }
};
