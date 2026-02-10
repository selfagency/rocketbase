import type { LayoutServerLoad } from './$types';

interface PageItem {
	id: string;
	title?: string;
	slug: string;
	order?: number;
	parent?: string;
	summary?: string;
	children?: PageItem[];
}

export const load: LayoutServerLoad = async ({ locals }) => {
	const { pb, logger } = locals;

	// Query pages collection — only published + visible pages appear in nav
	const pages = await pb.collection('pages').getFullList<PageItem>({
		fields: 'id,title,slug,order,parent,summary,published,visible',
		filter: 'published = true && visible = true',
		sort: 'order'
	});

	logger.withMetadata(pages).debug('Fetched pages for navigation');

	// Build hierarchical structure
	const navItems = buildHierarchy(pages);

	logger.withMetadata(navItems).debug('Built navigation hierarchy');

	return {
		navItems
	};
};

function buildHierarchy(pages: PageItem[]): PageItem[] {
	// Create a map for quick lookup
	const pageMap = new Map<string, PageItem>();
	const rootPages: PageItem[] = [];

	// First pass: initialize all pages with empty children arrays
	for (const page of pages) {
		pageMap.set(page.id, { ...page, children: [] });
	}

	// Second pass: build the hierarchy
	for (const page of pages) {
		const pageWithChildren = pageMap.get(page.id)!;

		if (page.parent) {
			// This is a child page, add it to its parent's children array
			const parent = pageMap.get(page.parent);
			if (parent) {
				parent.children!.push(pageWithChildren);
			} else {
				// Parent not found, treat as root
				rootPages.push(pageWithChildren);
			}
		} else {
			// This is a root page
			rootPages.push(pageWithChildren);
		}
	}

	// Sort children by order within each parent
	const sortByOrder = (items: PageItem[]) => {
		items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
		for (const item of items) {
			if (item.children && item.children.length > 0) {
				sortByOrder(item.children);
			}
		}
	};

	sortByOrder(rootPages);

	return rootPages;
}
