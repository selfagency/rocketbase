/**
 * Page hierarchy utilities for building and flattening page tree structures
 */

import type { PagesResponseWithAuthor } from '$lib/types/pocketbase-expanded';

export type PageWithChildren = PagesResponseWithAuthor & {
	children: PageWithChildren[];
};

export type PageWithDepth = PagesResponseWithAuthor & {
	depth: number;
};

/**
 * Build a hierarchical tree structure from a flat list of pages
 * @param pages - Flat list of pages
 * @returns Array of root pages with nested children
 */
export function buildPageHierarchy(pages: PagesResponseWithAuthor[]): PageWithChildren[] {
	const pageMap = new Map<string, PageWithChildren>();
	const rootPages: PageWithChildren[] = [];

	// First pass: create map and add children array
	for (const pageItem of pages) {
		pageMap.set(pageItem.id, { ...pageItem, children: [] } as PageWithChildren);
	}

	// Second pass: build tree structure
	for (const pageItem of pages) {
		const page = pageMap.get(pageItem.id)!;
		if (pageItem.parent && pageMap.has(pageItem.parent)) {
			pageMap.get(pageItem.parent)!.children.push(page);
		} else {
			rootPages.push(page);
		}
	}

	return rootPages;
}

/**
 * Flatten a hierarchical page tree into a display-ordered list with depth information
 * Children are sorted by their order field before flattening
 * @param pages - Array of pages (with children)
 * @param depth - Current depth level (defaults to 0)
 * @returns Flat array of pages with depth property
 */
export function flattenPageHierarchy(
	pages: PageWithChildren[],
	depth = 0
): PageWithDepth[] {
	const flat: PageWithDepth[] = [];

	for (const page of pages) {
		const { children, ...pageData } = page;

		// Add page with depth information
		flat.push({
			...pageData,
			depth
		} as PageWithDepth);

		if (children.length > 0) {
			// Sort children by order field
			children.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
			// Recursively flatten children with increased depth
			flat.push(...flattenPageHierarchy(children, depth + 1));
		}
	}

	return flat;
}

/**
 * Build and flatten page hierarchy in one step
 * @param pages - Flat list of pages
 * @returns Flat array of pages with depth property, in hierarchical display order
 */
export function buildAndFlattenPageHierarchy(
	pages: PagesResponseWithAuthor[]
): PageWithDepth[] {
	const hierarchy = buildPageHierarchy(pages);
	return flattenPageHierarchy(hierarchy);
}
