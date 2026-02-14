import type { MetadataResponse } from '$lib/types/pocketbase';

export interface PageItem {
  id: string;
  title?: string;
  slug: string;
  order?: number;
  parent?: string;
  summary?: string;
  children?: PageItem[];
}

export function buildHierarchy(pages: PageItem[]): PageItem[] {
  const pageMap = new Map<string, PageItem>();
  const rootPages: PageItem[] = [];

  for (const page of pages) {
    pageMap.set(page.id, { ...page, children: [] });
  }

  for (const page of pages) {
    const pageWithChildren = pageMap.get(page.id)!;

    if (page.parent) {
      const parent = pageMap.get(page.parent);
      if (parent) {
        parent.children!.push(pageWithChildren);
      } else {
        rootPages.push(pageWithChildren);
      }
    } else {
      rootPages.push(pageWithChildren);
    }
  }

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

export function metadataListToObject(metadata: MetadataResponse[]): Record<string, string> {
  const metadataObj: Record<string, string> = {};
  for (const item of metadata) {
    metadataObj[item.key] = item.value || '';
  }
  return metadataObj;
}
