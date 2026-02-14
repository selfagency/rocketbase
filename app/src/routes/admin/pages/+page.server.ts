import type { PagesResponseWithAuthor } from '$lib/types/pocketbase-expanded';
import { buildAndFlattenPageHierarchy } from '$lib/utils/page-hierarchy';
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
  const sort = url.searchParams.get('sort') || 'order';

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
    fields: 'id,title,slug,parent,order,published,visible,attachments,created,updated',
  });

  // Build and flatten hierarchical page structure
  const flatPages = buildAndFlattenPageHierarchy(result.items);

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
    status,
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
  },
};
