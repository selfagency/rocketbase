import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
import type { PagesResponse } from '$lib/types/pocketbase';
import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import DataTableActions from './data-table-actions.svelte';

export const columns: ColumnDef<PagesResponse>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => {
      const titleSnippet = createRawSnippet<[{ title: string; id: string }]>(getData => {
        const { title, id } = getData();
        return {
          render: () =>
            `<a href="/admin/pages/${id}" class="font-medium hover:underline">${title || '<em>Untitled</em>'}</a>`,
        };
      });
      return renderSnippet(titleSnippet, {
        title: row.original.title || '',
        id: row.original.id,
      });
    },
  },
  {
    accessorKey: 'slug',
    header: 'Slug',
  },
  {
    accessorKey: 'published',
    header: 'Published',
    cell: ({ row }) => {
      const publishedSnippet = createRawSnippet<[{ published: boolean }]>(getData => {
        const { published } = getData();
        const badge = published
          ? '<span class="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">Published</span>'
          : '<span class="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">Draft</span>';
        return {
          render: () => badge,
        };
      });
      return renderSnippet(publishedSnippet, {
        published: row.original.published || false,
      });
    },
  },
  {
    accessorKey: 'order',
    header: () => {
      const headerSnippet = createRawSnippet(() => ({
        render: () => '<div class="text-end">Order</div>',
      }));
      return renderSnippet(headerSnippet);
    },
    cell: ({ row }) => {
      const orderSnippet = createRawSnippet<[{ order: number | undefined }]>(getData => {
        const { order } = getData();
        return {
          render: () => `<div class="text-end">${order ?? '-'}</div>`,
        };
      });
      return renderSnippet(orderSnippet, {
        order: row.original.order,
      });
    },
  },
  {
    accessorKey: 'created',
    header: 'Created',
    cell: ({ row }) => {
      const dateSnippet = createRawSnippet<[{ created: string }]>(getData => {
        const { created } = getData();
        const formatted = new Date(created).toLocaleDateString();
        return {
          render: () => `<div class="text-sm text-muted-foreground">${formatted}</div>`,
        };
      });
      return renderSnippet(dateSnippet, {
        created: row.original.created,
      });
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => renderComponent(DataTableActions, { page: row.original }),
  },
];
