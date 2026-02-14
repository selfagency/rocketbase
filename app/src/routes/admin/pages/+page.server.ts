import type { PagesResponseWithAuthor } from '$lib/types/pocketbase-expanded';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	// Require authentication and editor/admin role
	if (!locals.user) error(401, 'Unauthorized');
	if (locals.user.role !== 'admin' && locals.user.role !== 'editor') {
		error(403, 'Forbidden - Requires editor or admin role');
	}

	const page = parseInt(url.searchParams.get('page') || '1');
	const perPage = parseInt(url.searchParams.get('perPage') || '10');
	const search = url.searchParams.get('search') || '';
	const status = url.searchParams.get('status') || 'all';
	const sort = url.searchParams.get('sort') || '-created';

	// Build filter for search and status
	const filters: string[] = [];

	if (search) {
		filters.push(`title ~ "${search}" || slug ~ "${search}"`);
	}

	if (status === 'draft') {
		filters.push('published = false');
	} else if (status === 'published') {
		filters.push('published = true');
	}

	const filter = filters.length > 0 ? filters.join(' && ') : '';

	// Fetch all pages to build hierarchical structure
	const result = await locals.pb.collection('pages').getList<PagesResponseWithAuthor>(1, 500, {
		sort,
		filter,
		fields: 'id,title,slug,parent,order,published,visible,image,created,updated'
	});

	// Build hierarchical structure: organize pages with children under parents
	type PageWithChildren = PagesResponseWithAuthor & { children: PageWithChildren[] };

	const pageMap = new Map<string, PageWithChildren>();
	const rootPages: PageWithChildren[] = [];

	// First pass: create map and add children array
	for (const pageItem of result.items) {
		pageMap.set(pageItem.id, { ...pageItem, children: [] } as PageWithChildren);
	}

	// Second pass: build tree structure
	for (const pageItem of result.items) {
		const page = pageMap.get(pageItem.id)!;
		if (pageItem.parent && pageMap.has(pageItem.parent)) {
			pageMap.get(pageItem.parent)!.children.push(page);
		} else {
			rootPages.push(page);
		}
	}

	// Flatten tree in display order (parents followed by indented children)

	function flattenPages(pages: PageWithChildren[], depth = 0): PagesResponseWithAuthor[] {
		const flat: PagesResponseWithAuthor[] = [];
		for (const page of pages) {
			const { children, ...pageData } = page;
			// attach depth for rendering hierarchy
			const pd = { ...(pageData as PagesResponseWithAuthor) } as any;
			pd.depth = depth;
			flat.push(pd as PagesResponseWithAuthor);
			if (children.length > 0) {
				// Sort children by order
				children.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
				flat.push(...flattenPages(children, depth + 1));
			}
		}
		return flat;
	}

	const flatPages = flattenPages(rootPages);

	// Apply pagination to flattened list
	const startIndex = (page - 1) * perPage;
	const endIndex = startIndex + perPage;
	const paginatedPages = flatPages.slice(startIndex, endIndex);
	const totalPages = Math.ceil(flatPages.length / perPage);

	return {
		pages: paginatedPages,
		totalPages,
		page,
		perPage,
		totalItems: flatPages.length,
		status
	};
};

export const actions: Actions = {
	delete: async ({ locals, request }) => {
		const data = await request.formData();
		// oxlint-disable-next-line typescript/no-base-to-string
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
