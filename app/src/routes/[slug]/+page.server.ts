import { error } from '@sveltejs/kit';
import type { PagesResponse } from '../../lib/types/pocketbase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, parent }) => {
	const { pb, logger } = locals;
	const { slug } = params;

	// Get layout data which contains navItems
	const { navItems } = await parent();

	// Find the page in navItems by slug (recursive search through hierarchy)
	const findPageBySlug = (items: typeof navItems, targetSlug: string): any => {
		for (const item of items) {
			if (item.slug === targetSlug) {
				return item;
			}
			if (item.children && item.children.length > 0) {
				const found = findPageBySlug(item.children, targetSlug);
				if (found) return found;
			}
		}
		return null;
	};

	const navItem = findPageBySlug(navItems, slug);

	if (!navItem) {
		logger.withMetadata({ slug }).debug('Page not found in navigation');
		throw error(404, 'Page not found');
	}

	// Fetch the full page data from PocketBase
	const page = await pb.collection('pages').getOne<PagesResponse>(navItem.id, {
		fields:
			'id,title,slug,content,summary,image,media,custom_css,created,updated,require_login,subscriber_only'
	});

	// Check if page requires login
	if (page.require_login && !locals.user) {
		throw error(403, 'Authentication required');
	}

	// Check if page is subscriber-only (you might want to implement subscription logic here)
	if (page.subscriber_only) {
		// TODO: Implement subscriber check
		// For now, just check if user exists (basic auth check)
		if (!locals.user) {
			throw error(403, 'Subscriber access required');
		}
	}

	logger.withMetadata({ slug, pageId: page.id }).debug('Loaded page content');

	return {
		page
	};
};
