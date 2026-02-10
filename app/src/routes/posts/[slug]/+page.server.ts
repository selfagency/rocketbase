import * as m from '$lib/paraglide/messages';
import { error } from '@sveltejs/kit';
import type { PostsResponse } from '../../../lib/types/pocketbase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  const { pb } = locals;

  try {
    // Find the post by slug
    const post = await pb.collection('posts').getFirstListItem<
      PostsResponse<{
        author: { id: string; name?: string; email: string; avatar?: string }[];
        tags: { id: string; tag: string; slug: string }[];
      }>
    >(`slug = "${params.slug}"`, {
      expand: 'author,tags',
    });

    return {
      post,
    };
  } catch (err) {
    console.error('Error loading post:', err);
    throw error(404, m['error.post_not_found']());
  }
};
