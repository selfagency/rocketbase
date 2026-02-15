import { getServerPageSizes } from '$lib/server/page-size-store';
import type { PortfolioResponseWithExpanded } from '$lib/types/pocketbase-expanded';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
  const { pb } = locals;
  const { postsPerPage } = await getServerPageSizes(pb);

  const page = parseInt(url.searchParams.get('page') || '1');
  const perPage = parseInt(url.searchParams.get('perPage') || String(postsPerPage));

  try {
    const result = await pb.collection('portfolio').getList<PortfolioResponseWithExpanded>(page, perPage, {
      filter: 'published = true && visible = true',
      sort: '-updated',
      expand: 'media',
    });

    return {
      items: result.items,
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
      .withMetadata(err as Error)
      .error('Error loading portfolio items');

    return {
      items: [],
      pagination: {
        page: 1,
        perPage,
        totalItems: 0,
        totalPages: 0,
      },
    };
  }
};
