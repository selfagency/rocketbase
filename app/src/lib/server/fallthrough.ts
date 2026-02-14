import type { PageItem } from './nav';
export { RESERVED_ROUTES } from './page-fallthrough';

function findBySlug(items: PageItem[], slug: string): PageItem | null {
  for (const item of items) {
    if (item.slug === slug) return item;
    if (item.children && item.children.length > 0) {
      const found = findBySlug(item.children, slug);
      if (found) return found;
    }
  }
  return null;
}

function findById(items: PageItem[], parentId: string): PageItem | null {
  for (const item of items) {
    if (item.id === parentId) return item;
    if (item.children && item.children.length > 0) {
      const found = findById(item.children, parentId);
      if (found) return found;
    }
  }
  return null;
}

export function findPageBySlug(items: PageItem[], targetSlug: string): PageItem | null {
  const exactMatch = findBySlug(items, targetSlug);
  if (exactMatch) return exactMatch;

  const pathParts = targetSlug.split('/');
  if (pathParts.length === 2) {
    const [parentSlug, childSlug] = pathParts;
    const parent = findBySlug(items, parentSlug);
    if (parent?.children) {
      for (const child of parent.children) {
        if (child.slug === childSlug && child.parent === parent.id) {
          return child;
        }
      }
    }
  }

  return null;
}

export function constructFullPath(item: PageItem, items: PageItem[]): string {
  const pathSegments: string[] = [item.slug];
  let currentItem = item;

  while (currentItem.parent) {
    const parentItem = findById(items, currentItem.parent);
    if (!parentItem) break;
    pathSegments.unshift(parentItem.slug);
    currentItem = parentItem;
  }

  return `/${pathSegments.join('/')}`;
}
