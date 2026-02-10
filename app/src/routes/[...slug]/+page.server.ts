import * as m from '$lib/paraglide/messages';
import { error, redirect } from '@sveltejs/kit';
import type { PagesResponse } from '../../lib/types/pocketbase';
import type { PageServerLoad } from './$types';

// Routes that should be handled by dedicated route files, not the fallthrough
const RESERVED_ROUTES = new Set([
  'account',
  'auth',
  'forgot-password',
  'login',
  'logout',
  'register',
  'verify-email',
  // Add any other reserved route names here
]);

export const load: PageServerLoad = async ({ params, locals, parent, url }) => {
  const { pb, logger } = locals;
  // params.slug is now a string like "about/test" for [...slug] routes
  const { slug } = params;

  // Check if the first segment matches a reserved route
  const firstSegment = slug.split('/')[0];
  if (RESERVED_ROUTES.has(firstSegment)) {
    logger.withMetadata({ slug }).debug('Slug matches reserved route, skipping fallthrough');
    throw error(404, m['error.page_not_found']());
  }

  // Get layout data which contains navItems
  const { navItems } = await parent();

  // Find the page by slug path, handling hierarchical paths
  const findPageBySlug = (items: typeof navItems, targetSlug: string): any => {
    // First try to find by exact slug match (for root level pages)
    for (const item of items) {
      if (item.slug === targetSlug) {
        return item;
      }
      // Also check children recursively
      if (item.children && item.children.length > 0) {
        const found = findPageBySlug(item.children, targetSlug);
        if (found) return found;
      }
    }

    // If no exact match, try parsing as hierarchical path (parentSlug/childSlug)
    const pathParts = targetSlug.split('/');
    if (pathParts.length === 2) {
      const [parentSlug, childSlug] = pathParts;

      // Find the parent page
      const findParentBySlug = (searchItems: typeof navItems, slug: string): any => {
        for (const item of searchItems) {
          if (item.slug === slug) {
            return item;
          }
          if (item.children && item.children.length > 0) {
            const found = findParentBySlug(item.children, slug);
            if (found) return found;
          }
        }
        return null;
      };

      const parent = findParentBySlug(items, parentSlug);
      if (parent && parent.children) {
        // Find the child page with matching slug and parent ID
        for (const child of parent.children) {
          if (child.slug === childSlug && child.parent === parent.id) {
            return child;
          }
        }
      }
    }

    return null;
  };

  const navItem = findPageBySlug(navItems, slug);

  if (!navItem) {
    logger.withMetadata({ slug }).debug('Page not found in navigation');
    throw error(404, m['error.page_not_found']());
  }

  // Check if this page has a parent and construct the correct URL path
  const constructFullPath = (item: typeof navItem, items: typeof navItems): string => {
    const pathSegments: string[] = [item.slug];

    // Walk up the hierarchy to build the full path
    let currentItem = item;
    while (currentItem.parent) {
      // Find the parent item
      const findParent = (searchItems: typeof navItems, parentId: string): any => {
        for (const searchItem of searchItems) {
          if (searchItem.id === parentId) {
            return searchItem;
          }
          if (searchItem.children && searchItem.children.length > 0) {
            const found = findParent(searchItem.children, parentId);
            if (found) return found;
          }
        }
        return null;
      };

      const parentItem = findParent(items, currentItem.parent);
      if (parentItem) {
        pathSegments.unshift(parentItem.slug);
        currentItem = parentItem;
      } else {
        break;
      }
    }

    return '/' + pathSegments.join('/');
  };

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
    fields: 'id,title,slug,content,summary,image,media,custom_css,created,updated,require_login,subscriber_only',
  });

  // Check if page requires login
  if (page.require_login && !locals.user) {
    throw error(403, m['error.authentication_required']());
  }

  // Check if page is subscriber-only (you might want to implement subscription logic here)
  if (page.subscriber_only) {
    // TODO: Implement subscriber check
    // For now, just check if user exists (basic auth check)
    if (!locals.user) {
      throw error(403, m['error.subscriber_access_required']());
    }
  }

  logger.withMetadata({ slug, pageId: page.id, path: correctPath }).debug('Loaded page content');

  return {
    page,
  };
};
