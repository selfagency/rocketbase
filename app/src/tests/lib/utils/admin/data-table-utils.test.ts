import { describe, expect, it } from 'vitest';

import {
  getColumnCellClass,
  getColumnWidthClass,
  getResponsiveColumnVisibility,
  getSortState,
} from '../../../../lib/utils/admin/data-table-utils';

describe('data-table-utils', () => {
  it('toggles responsive columns based on breakpoint', () => {
    expect(
      getResponsiveColumnVisibility({
        current: { title: true },
        width: 1200,
        breakpoint: 1024,
      })
    ).toEqual({
      title: true,
      slug: true,
      summary: true,
    });

    expect(
      getResponsiveColumnVisibility({
        current: { title: true, slug: true },
        width: 800,
        breakpoint: 1024,
        columns: ['slug'],
      })
    ).toEqual({
      title: true,
      slug: false,
    });
  });

  it('returns column width classes with safe fallback', () => {
    const widths = { title: 'min-w-56', date: 'w-24' };

    expect(getColumnWidthClass(widths, 'title')).toBe('min-w-56');
    expect(getColumnWidthClass(widths, 'unknown')).toBe('');
  });

  it('composes cell class names from width and behavior maps', () => {
    expect(
      getColumnCellClass({
        columnWidthClasses: { title: 'min-w-56' },
        columnBehaviorClasses: { title: 'whitespace-normal' },
        columnId: 'title',
      })
    ).toBe('min-w-56 whitespace-normal');

    expect(
      getColumnCellClass({
        columnWidthClasses: { title: 'min-w-56' },
        columnId: 'unknown',
      })
    ).toBe('');
  });

  it('derives sort state and handles default ascending key', () => {
    expect(getSortState({ currentSort: '', sortKey: 'order', defaultAscSortKey: 'order' })).toEqual({
      asc: true,
      desc: false,
    });

    expect(getSortState({ currentSort: 'title', sortKey: 'title' })).toEqual({
      asc: true,
      desc: false,
    });

    expect(getSortState({ currentSort: '-title', sortKey: 'title' })).toEqual({
      asc: false,
      desc: true,
    });
  });
});
