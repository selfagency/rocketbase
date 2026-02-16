import type { FaqsResponse } from '$lib/types/pocketbase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  const { pb } = locals;

  try {
    const faqs = await pb.collection('faqs').getFullList<FaqsResponse>({
      fields: 'id,question,answer,slug,category,sort_order,created,updated,is_published,locale',
      filter: 'is_published = true',
      sort: 'sort_order,created',
    });

    const sortedFaqs = [...faqs].sort((a, b) => {
      const bySortOrder = (a.sort_order ?? 0) - (b.sort_order ?? 0);
      if (bySortOrder !== 0) {
        return bySortOrder;
      }

      return new Date(a.created).getTime() - new Date(b.created).getTime();
    });

    return {
      faqs: sortedFaqs,
      loadError: undefined,
    };
  } catch (err) {
    locals.logger
      .withContext({
        route: url.pathname,
        userId: locals.pb?.authStore?.record?.id,
        requestId: locals.requestId,
      })
      .withContext(err as Error)
      .error('Error loading FAQs');

    return {
      faqs: [],
      loadError: 'Unable to load FAQs right now. Please try again in a moment.',
    };
  }
};
