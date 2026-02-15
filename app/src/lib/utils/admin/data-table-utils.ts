import type { VisibilityState } from '@tanstack/table-core';

export function getResponsiveColumnVisibility(params: {
  current: VisibilityState;
  width: number;
  breakpoint: number;
  columns?: string[];
}): VisibilityState {
  const showExtendedColumns = params.width >= params.breakpoint;
  const columns = params.columns ?? ['slug', 'summary'];

  return columns.reduce<VisibilityState>(
    (acc, columnId) => {
      acc[columnId] = showExtendedColumns;
      return acc;
    },
    { ...params.current }
  );
}

export function getColumnWidthClass(columnWidthClasses: Record<string, string>, columnId: string): string {
  return columnWidthClasses[columnId] ?? '';
}

export function getColumnCellClass(params: {
  columnWidthClasses: Record<string, string>;
  columnBehaviorClasses?: Record<string, string>;
  columnId: string;
}): string {
  const widthClass = getColumnWidthClass(params.columnWidthClasses, params.columnId);
  const behaviorClass = params.columnBehaviorClasses?.[params.columnId] ?? '';
  return `${widthClass} ${behaviorClass}`.trim();
}

export function getSortState(params: { currentSort: string; sortKey: string; defaultAscSortKey?: string }): {
  asc: boolean;
  desc: boolean;
} {
  if (!params.currentSort && params.defaultAscSortKey === params.sortKey) {
    return { asc: true, desc: false };
  }

  return {
    asc: params.currentSort === params.sortKey,
    desc: params.currentSort === `-${params.sortKey}`,
  };
}
