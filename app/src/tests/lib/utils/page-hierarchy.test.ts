import { describe, expect, it } from 'vitest';
import {
  buildAndFlattenPageHierarchy,
  buildPageHierarchy,
  flattenPageHierarchy,
  type PageWithChildren,
} from '../../../lib/utils/page-hierarchy';

describe('page-hierarchy utilities', () => {
  describe('buildPageHierarchy', () => {
    it('builds hierarchy from flat list with parent-child relationships', () => {
      const pages = [
        { id: '1', title: 'Root', parent: null, order: 1 },
        { id: '2', title: 'Child 1', parent: '1', order: 1 },
        { id: '3', title: 'Child 2', parent: '1', order: 2 },
        { id: '4', title: 'Grandchild', parent: '2', order: 1 },
      ] as any;

      const hierarchy = buildPageHierarchy(pages);

      expect(hierarchy).toHaveLength(1);
      expect(hierarchy[0].id).toBe('1');
      expect(hierarchy[0].children).toHaveLength(2);
      expect(hierarchy[0].children[0].id).toBe('2');
      expect(hierarchy[0].children[0].children).toHaveLength(1);
      expect(hierarchy[0].children[0].children[0].id).toBe('4');
    });

    it('handles multiple root pages', () => {
      const pages = [
        { id: '1', title: 'Root 1', parent: null, order: 1 },
        { id: '2', title: 'Root 2', parent: null, order: 2 },
        { id: '3', title: 'Child of Root 1', parent: '1', order: 1 },
      ] as any;

      const hierarchy = buildPageHierarchy(pages);

      expect(hierarchy).toHaveLength(2);
      expect(hierarchy[0].id).toBe('1');
      expect(hierarchy[1].id).toBe('2');
      expect(hierarchy[0].children).toHaveLength(1);
      expect(hierarchy[1].children).toHaveLength(0);
    });

    it('handles orphaned pages (parent not found) as root pages', () => {
      const pages = [
        { id: '1', title: 'Page 1', parent: 'nonexistent', order: 1 },
        { id: '2', title: 'Page 2', parent: null, order: 1 },
      ] as any;

      const hierarchy = buildPageHierarchy(pages);

      expect(hierarchy).toHaveLength(2);
    });

    it('handles empty page list', () => {
      const hierarchy = buildPageHierarchy([]);
      expect(hierarchy).toEqual([]);
    });

    it('preserves all page properties', () => {
      const pages = [
        {
          id: '1',
          title: 'Test Page',
          slug: 'test-page',
          content: 'Content',
          parent: null,
          order: 1,
          published: true,
        },
      ] as any;

      const hierarchy = buildPageHierarchy(pages);

      expect(hierarchy[0]).toMatchObject({
        id: '1',
        title: 'Test Page',
        slug: 'test-page',
        content: 'Content',
        published: true,
      });
    });

    it('handles deep nesting', () => {
      const pages = [
        { id: '1', title: 'Level 1', parent: null, order: 1 },
        { id: '2', title: 'Level 2', parent: '1', order: 1 },
        { id: '3', title: 'Level 3', parent: '2', order: 1 },
        { id: '4', title: 'Level 4', parent: '3', order: 1 },
      ] as any;

      const hierarchy = buildPageHierarchy(pages);

      expect(hierarchy[0].children[0].children[0].children[0].id).toBe('4');
    });
  });

  describe('flattenPageHierarchy', () => {
    it('flattens hierarchy into ordered list with depth', () => {
      const hierarchy: PageWithChildren[] = [
        {
          id: '1',
          title: 'Root',
          children: [
            {
              id: '2',
              title: 'Child 1',
              order: 1,
              children: [],
            } as any,
            {
              id: '3',
              title: 'Child 2',
              order: 2,
              children: [],
            } as any,
          ],
        } as any,
      ];

      const flat = flattenPageHierarchy(hierarchy);

      expect(flat).toHaveLength(3);
      expect(flat[0]).toMatchObject({ id: '1', depth: 0 });
      expect(flat[1]).toMatchObject({ id: '2', depth: 1 });
      expect(flat[2]).toMatchObject({ id: '3', depth: 1 });
      expect(flat[0].orderLabel).toBe('1');
      expect(flat[1].orderLabel).toBe('1-1');
      expect(flat[2].orderLabel).toBe('1-2');
    });

    it('sorts children by order field before flattening', () => {
      const hierarchy: PageWithChildren[] = [
        {
          id: '1',
          title: 'Root',
          children: [
            { id: '3', title: 'Third', order: 3, children: [] } as any,
            { id: '1', title: 'First', order: 1, children: [] } as any,
            { id: '2', title: 'Second', order: 2, children: [] } as any,
          ],
        } as any,
      ];

      const flat = flattenPageHierarchy(hierarchy);

      expect(flat[1].id).toBe('1'); // First
      expect(flat[2].id).toBe('2'); // Second
      expect(flat[3].id).toBe('3'); // Third
    });

    it('handles pages without order field', () => {
      const hierarchy: PageWithChildren[] = [
        {
          id: '1',
          title: 'Root',
          children: [
            { id: '2', title: 'No order', children: [] } as any,
            { id: '3', title: 'Has order', order: 1, children: [] } as any,
          ],
        } as any,
      ];

      const flat = flattenPageHierarchy(hierarchy);

      // Pages without order should be sorted last (default 999)
      expect(flat[1].id).toBe('3');
      expect(flat[2].id).toBe('2');
    });

    it('correctly assigns depth for nested structures', () => {
      const hierarchy: PageWithChildren[] = [
        {
          id: '1',
          title: 'Root',
          children: [
            {
              id: '2',
              title: 'Child',
              children: [
                {
                  id: '3',
                  title: 'Grandchild',
                  children: [],
                } as any,
              ],
            } as any,
          ],
        } as any,
      ];

      const flat = flattenPageHierarchy(hierarchy);

      expect(flat[0].depth).toBe(0);
      expect(flat[1].depth).toBe(1);
      expect(flat[2].depth).toBe(2);
      expect(flat[0].orderLabel).toBe('1');
      expect(flat[1].orderLabel).toBe('1-1');
      expect(flat[2].orderLabel).toBe('1-1-1');
    });

    it('handles empty hierarchy', () => {
      const flat = flattenPageHierarchy([]);
      expect(flat).toEqual([]);
    });

    it('removes children property from flattened pages', () => {
      const hierarchy: PageWithChildren[] = [
        {
          id: '1',
          title: 'Root',
          children: [{ id: '2', title: 'Child', children: [] } as any],
        } as any,
      ];

      const flat = flattenPageHierarchy(hierarchy);

      expect(flat[0]).not.toHaveProperty('children');
      expect(flat[1]).not.toHaveProperty('children');
    });
  });

  describe('buildAndFlattenPageHierarchy', () => {
    it('builds and flattens in one step', () => {
      const pages = [
        { id: '1', title: 'Root', parent: null, order: 1 },
        { id: '2', title: 'Child 1', parent: '1', order: 1 },
        { id: '3', title: 'Child 2', parent: '1', order: 2 },
      ] as any;

      const result = buildAndFlattenPageHierarchy(pages);

      expect(result).toHaveLength(3);
      expect(result[0]).toMatchObject({ id: '1', depth: 0 });
      expect(result[1]).toMatchObject({ id: '2', depth: 1 });
      expect(result[2]).toMatchObject({ id: '3', depth: 1 });
    });

    it('maintains hierarchical order', () => {
      const pages = [
        { id: '1', title: 'Root', parent: null, order: 1 },
        { id: '2', title: 'Child 1', parent: '1', order: 2 },
        { id: '3', title: 'Grandchild', parent: '2', order: 1 },
        { id: '4', title: 'Child 2', parent: '1', order: 1 },
      ] as any;

      const result = buildAndFlattenPageHierarchy(pages);

      expect(result.map(p => p.id)).toEqual(['1', '4', '2', '3']);
    });

    it('handles empty list', () => {
      const result = buildAndFlattenPageHierarchy([]);
      expect(result).toEqual([]);
    });

    it('handles complex hierarchy with multiple roots and levels', () => {
      const pages = [
        { id: 'r1', title: 'Root 1', parent: null, order: 1 },
        { id: 'r2', title: 'Root 2', parent: null, order: 2 },
        { id: 'r1c1', title: 'Root 1 Child 1', parent: 'r1', order: 1 },
        { id: 'r1c2', title: 'Root 1 Child 2', parent: 'r1', order: 2 },
        { id: 'r1c1g1', title: 'Root 1 Child 1 Grandchild', parent: 'r1c1', order: 1 },
        { id: 'r2c1', title: 'Root 2 Child 1', parent: 'r2', order: 1 },
      ] as any;

      const result = buildAndFlattenPageHierarchy(pages);

      expect(result.map(p => p.id)).toEqual(['r1', 'r1c1', 'r1c1g1', 'r1c2', 'r2', 'r2c1']);
      expect(result.map(p => p.depth)).toEqual([0, 1, 2, 1, 0, 1]);
      expect(result.map(p => p.orderLabel)).toEqual(['1', '1-1', '1-1-1', '1-2', '2', '2-1']);
    });

    it('creates hierarchical sibling labels based on sorted position', () => {
      const pages = [
        { id: 'home', title: 'Home', parent: null, order: 1 },
        { id: 'posts', title: 'Posts', parent: null, order: 2 },
        { id: 'about', title: 'About', parent: null, order: 3 },
        { id: 'authors', title: 'Authors', parent: 'about', order: 999 },
      ] as any;

      const result = buildAndFlattenPageHierarchy(pages);
      const authors = result.find(p => p.id === 'authors');

      expect(authors?.orderLabel).toBe('3-1');
    });
  });
});
