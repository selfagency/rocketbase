import * as m from '$lib/paraglide/messages.js';
import { error } from '@sveltejs/kit';
import type { PostsResponse } from '../../../lib/types/pocketbase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const { pb } = locals;

	try {
		// Find the post by slug
		const post = await pb.collection('posts').getFirstListItem<
			PostsResponse<{
				author: { id: string; name?: string; email: string; avatar?: string }[];
				tags: { id: string; tag: string; slug: string }[];
			}>
		>(`slug = "${params.slug}"`, {
			expand: 'author,tags'
		});

		return {
			post
		};
	} catch (err) {
		locals.logger
			.withContext({
				route: url.pathname,
				userId: locals.pb?.authStore?.record?.id,
				requestId: locals.requestId
			})
			.withMetadata(err as Error)
			.error('Unable to fetch post');
		throw error(404, m['error.post_not_found']());
	}
};
