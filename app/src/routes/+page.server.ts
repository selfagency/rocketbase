import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // Try to fetch a home page
  let page = null;
  try {
    page = await locals.pb.collection('pages').getFirstListItem('slug="home"');
  } catch (error) {
    locals.logger.withMetadata(error as Error).error('Unable to fetch content');
  }

  return {
    user: locals.user,
    page,
  };
};
