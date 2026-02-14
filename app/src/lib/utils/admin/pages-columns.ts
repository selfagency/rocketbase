import DataTableActions from '$lib/components/admin/pages/data-table-actions.svelte';
import PageTitleCell from '$lib/components/admin/pages/page-title-cell.svelte';
import PublishVisibilityCell from '$lib/components/admin/pages/publish-visibility-cell.svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
import * as m from '$lib/paraglide/messages';
import type { PagesResponseWithAuthor } from '$lib/types/pocketbase-expanded';
import ImageIcon from '@lucide/svelte/icons/image';
import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';

export const columns: ColumnDef<PagesResponseWithAuthor>[] = [
  {
    accessorKey: 'order',
    header: '',
    meta: { sortKey: 'order', tooltip: m['admin.pages.order_tooltip']() },
    cell: ({ row }) => {
      const orderSnippet = createRawSnippet<[{ orderLabel: string }]>(getData => {
        const { orderLabel } = getData();
        return {
          render: () => `<div class="text-sm text-center font-mono">${orderLabel}</div>`,
        };
      });
      return renderSnippet(orderSnippet, {
        orderLabel: (row.original as any).orderLabel || `${row.original.order || 0}`,
      });
    },
  },
  {
    accessorKey: 'image',
    header: '',
    cell: ({ row }) => {
      const { image, id } = row.original as any;
      if (!image) {
        return renderComponent(ImageIcon, {
          class: 'w-8 h-8 text-gray-300 p-2 bg-gray-100 rounded',
        });
      }
      const imageUrl = `http://127.0.0.1:8090/api/files/pages/${id}/${image}?thumb=100x100`;
      return `<img src="${imageUrl}" alt="Thumbnail" class="w-12 h-12 object-cover rounded" />`;
    },
  },
  {
    accessorKey: 'title',
    header: m['admin.pages.title_column'](),
    meta: { sortKey: 'title' },
    cell: ({ row }) =>
      renderComponent(PageTitleCell, {
        title: row.original.title || '',
        id: row.original.id,
        depth: (row.original as any).depth || 0,
      }),
  },
  {
    accessorKey: 'slug',
    header: m['admin.pages.slug'](),
    meta: { sortKey: 'slug' },
  },
  {
    accessorKey: 'published',
    header: m['admin.pages.published'](),
    cell: ({ row }) =>
      renderComponent(PublishVisibilityCell as any, {
        published: row.original.published || false,
        visible: row.original.visible || false,
      }),
  },
  {
    accessorKey: 'created',
    header: m['admin.pages.created'](),
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
    accessorKey: 'updated',
    header: m['admin.pages.updated'](),
    cell: ({ row }) => {
      const dateSnippet = createRawSnippet<[{ updated: string }]>(getData => {
        const { updated } = getData();
        const formatted = new Date(updated).toLocaleDateString();
        return {
          render: () => `<div class="text-sm text-muted-foreground">${formatted}</div>`,
        };
      });
      return renderSnippet(dateSnippet, {
        updated: row.original.updated,
      });
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => renderComponent(DataTableActions, { page: row.original }),
  },
];
