import * as m from '$lib/paraglide/messages';
import { constructFullPath, findPageBySlug } from '$lib/server/fallthrough';
import {
  FALLTHROUGH_PAGE_FIELDS,
  getFallthroughAccessError,
  isReservedFallthroughSlug,
} from '$lib/server/page-fallthrough';
import { error, redirect } from '@sveltejs/kit';
import type { PagesResponse } from '../../lib/types/pocketbase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, parent, url }) => {
  const { pb, logger } = locals;
  // params.slug is now a string like "about/test" for [...slug] routes
  const { slug } = params;

  // Check if the first segment matches a reserved route
  if (isReservedFallthroughSlug(slug)) {
    logger.withMetadata({ slug }).debug('Slug matches reserved route, skipping fallthrough');
    throw error(404, m['error.page_not_found']());
  }

  // Get layout data which contains navItems
  const { navItems } = await parent();

  const navItem = findPageBySlug(navItems, slug);

  if (!navItem) {
    logger.withMetadata({ slug }).debug('Page not found in navigation');
    throw error(404, m['error.page_not_found']());
  }

  // Check if this page has a parent and construct the correct URL path
  const correctPath = constructFullPath(navItem, navItems);
  const currentPath = url.pathname;

  // If the current path doesn't match the correct hierarchical path, redirect
  if (currentPath !== correctPath) {
    logger
      .withMetadata({ currentPath, correctPath, slug: navItem.slug })
      .debug('Redirecting to correct hierarchical path');
    throw redirect(301, correctPath);
  }

  // Fetch the full page data from PocketBase
  const page = await pb.collection('pages').getOne<PagesResponse>(navItem.id, {
    fields: FALLTHROUGH_PAGE_FIELDS,
  });

  const accessError = getFallthroughAccessError(page, Boolean(locals.user));
  if (accessError) {
    throw error(403, m[accessError]());
  }

  logger.withMetadata({ slug, pageId: page.id, path: correctPath }).debug('Loaded page content');

  return {
    page,
  };
};
