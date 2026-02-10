import type { LayoutServerLoad } from './$types';

interface PageItem {
  id: string;
  title?: string;
  slug: string;
  order?: number;
  parent?: string;
  children?: PageItem[];
}

export const load: LayoutServerLoad = async ({ locals }) => {
  // Query pages collection with only the fields we need
  const pages = await locals.pb.collection('pages').getFullList<PageItem>({
    fields: 'id,title,slug,order,parent',
    sort: 'order',
  });

  // Build hierarchical structure
  const navItems = buildHierarchy(pages);

  return {
    navItems,
  };
};

function buildHierarchy(pages: PageItem[]): PageItem[] {
  // Create a map for quick lookup
  const pageMap = new Map<string, PageItem>();
  const rootPages: PageItem[] = [];

  // First pass: initialize all pages with empty children arrays
  pages.forEach(page => {
    pageMap.set(page.id, { ...page, children: [] });
  });

  // Second pass: build the hierarchy
  pages.forEach(page => {
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
  });

  // Sort children by order within each parent
  const sortByOrder = (items: PageItem[]) => {
    items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    items.forEach(item => {
      if (item.children && item.children.length > 0) {
        sortByOrder(item.children);
      }
    });
  };

  sortByOrder(rootPages);

  return rootPages;
}
