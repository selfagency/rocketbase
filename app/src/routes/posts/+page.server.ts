import type { PostsResponseWithExpanded } from '$lib/types/pocketbase-expanded';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const { pb } = locals;

	// Get pagination parameters from URL
	const page = parseInt(url.searchParams.get('page') || '1');
	const perPage = parseInt(url.searchParams.get('perPage') || '10');

	try {
		// Fetch paginated posts
		const result = await pb.collection('posts').getList<PostsResponseWithExpanded>(page, perPage, {
			filter: 'published = true',
			sort: '-created',
			expand: 'author,tags'
		});

		return {
			posts: result.items,
			pagination: {
				page: result.page,
				perPage: result.perPage,
				totalItems: result.totalItems,
				totalPages: result.totalPages
			}
		};
	} catch (err) {
		locals.logger
			.withContext({
				route: url.pathname,
				userId: locals.pb?.authStore?.record?.id,
				requestId: locals.requestId
			})
			.withContext(err as Error)
			.error('Error loading posts');
		return {
			posts: [],
			pagination: {
				page: 1,
				perPage,
				totalItems: 0,
				totalPages: 0
			}
		};
	}
};
