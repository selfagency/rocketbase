import type { PortfolioResponseWithExpanded } from '$lib/types/pocketbase-expanded';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.user) error(401, 'Unauthorized');
  if (locals.user.role !== 'admin' && locals.user.role !== 'editor') {
    error(403, 'Forbidden - Requires editor or admin role');
  }

  const page = parseInt(url.searchParams.get('page') || '1');
  const perPage = parseInt(url.searchParams.get('perPage') || '10');
  const search = url.searchParams.get('search') || '';
  const status = url.searchParams.get('status') || 'all';
  const sort = url.searchParams.get('sort') || '-updated';

  const filters: string[] = [];

  if (status === 'trash') {
    filters.push('in_trash = true');
  } else {
    filters.push('in_trash != true');

    if (status === 'published') filters.push('published = true');
    else if (status === 'draft') filters.push('published = false');
  }

  if (search) {
    filters.push(`title ~ "${search}" || slug ~ "${search}" || summary ~ "${search}"`);
  }

  const filter = filters.length > 0 ? filters.join(' && ') : '';

  const result = await locals.pb.collection('portfolio').getList<PortfolioResponseWithExpanded>(page, perPage, {
    sort,
    filter,
    expand: 'media',
  });

  return {
    items: result.items,
    totalPages: result.totalPages,
    page: result.page,
    perPage: result.perPage,
    totalItems: result.totalItems,
    status,
  };
};

export const actions: Actions = {
  delete: async ({ locals, request }) => {
    const data = await request.formData();
    const id = data.get('id')?.toString();

    if (!id) {
      return fail(400, { error: 'Missing portfolio ID' });
    }

    try {
      await locals.pb.collection('portfolio').update(id, {
        published: false,
        visible: false,
        in_trash: true,
      });
      return { success: true };
    } catch (err) {
      const pbError = err as Error;
      return fail(500, { error: pbError.message || 'Failed to delete portfolio item' });
    }
  },

  undelete: async ({ locals, request }) => {
    const data = await request.formData();
    const id = data.get('id')?.toString();

    if (!id) {
      return fail(400, { error: 'Missing portfolio ID' });
    }

    try {
      await locals.pb.collection('portfolio').update(id, {
        in_trash: false,
      });
      return { success: true };
    } catch (err) {
      const pbError = err as Error;
      return fail(500, { error: pbError.message || 'Failed to restore portfolio item' });
    }
  },
};
