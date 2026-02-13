import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { PagesResponse } from '$lib/types/pocketbase';

export const load: PageServerLoad = async ({ locals, url }) => {
	// Require authentication and editor/admin role
	if (!locals.user) error(401, 'Unauthorized');
	if (locals.user.role !== 'admin' && locals.user.role !== 'editor') {
		error(403, 'Forbidden - Requires editor or admin role');
	}

	const page = parseInt(url.searchParams.get('page') || '1');
	const perPage = parseInt(url.searchParams.get('perPage') || '10');
	const search = url.searchParams.get('search') || '';
	const sort = url.searchParams.get('sort') || '-created';

	// Build filter for search
	const filter = search
		? `title ~ "${search}" || slug ~ "${search}"`
		: '';

	const result = await locals.pb.collection('pages').getList<PagesResponse>(page, perPage, {
		sort,
		filter,
		fields: 'id,title,slug,published,order,created,updated'
	});

	return {
		pages: result.items,
		totalPages: result.totalPages,
		page: result.page,
		perPage: result.perPage,
		totalItems: result.totalItems
	};
};

export const actions: Actions = {
	delete: async ({ locals, request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'Missing page ID' });
		}

		try {
			await locals.pb.collection('pages').delete(id);
			return { success: true };
		} catch (err) {
			const error = err as Error;
			return fail(500, { error: error.message || 'Failed to delete page' });
		}
	}
};
