import { describe, expect, it } from 'vitest';

import { buildHierarchy, metadataListToObject } from '../../lib/server/nav';

describe('nav utils', () => {
  it('builds a sorted tree and keeps orphan pages at root', () => {
    const pages = [
      { id: 'child-2', slug: 'child-2', parent: 'root', order: 20 },
      { id: 'root', slug: 'root', order: 10 },
      { id: 'child-1', slug: 'child-1', parent: 'root', order: 5 },
      { id: 'orphan', slug: 'orphan', parent: 'missing-parent', order: 0 },
      { id: 'grandchild', slug: 'grandchild', parent: 'child-1', order: 1 },
    ];

    const hierarchy = buildHierarchy(pages);

    expect(hierarchy.map(page => page.id)).toEqual(['orphan', 'root']);
    expect(hierarchy[1].children?.map(page => page.id)).toEqual(['child-1', 'child-2']);
    expect(hierarchy[1].children?.[0].children?.map(page => page.id)).toEqual(['grandchild']);
  });

  it('converts metadata list to key/value object with empty fallback values', () => {
    const metadata = [
      { key: 'site_title', value: 'Rocketbase' },
      { key: 'site_description', value: null },
    ] as any;

    expect(metadataListToObject(metadata)).toEqual({
      site_title: 'Rocketbase',
      site_description: '',
    });
  });
});
