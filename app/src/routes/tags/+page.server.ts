import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { pb } = locals;

	try {
		// Fetch all tags
		const tags = await pb.collection('tags').getFullList({
			sort: 'tag'
		});

		// Get post count for each tag
		const tagsWithCount = await Promise.all(
			tags.map(async (tag) => {
				const count = await pb.collection('posts').getList(1, 1, {
					filter: `published = true && tags.id ?= "${tag.id}"`,
					fields: 'id'
				});
				return {
					...tag,
					postCount: count.totalItems
				};
			})
		);

		return {
			tags: tagsWithCount
		};
	} catch (err) {
		locals.logger
			.withContext({
				route: '/tags',
				userId: locals.pb?.authStore?.record?.id,
				requestId: locals.requestId
			})
			.withContext(err as Error)
			.error('Error loading tags');
		return {
			tags: []
		};
	}
};
