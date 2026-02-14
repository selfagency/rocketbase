import DataTableActions from '$lib/components/admin/pages/data-table-actions.svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
import * as m from '$lib/paraglide/messages.js';
import type { PagesResponseWithAuthor } from '$lib/types/pocketbase-expanded';
import EyeIcon from '@lucide/svelte/icons/eye';
import EyeOffIcon from '@lucide/svelte/icons/eye-off';
import ImageIcon from '@lucide/svelte/icons/image';
import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';

export const columns: ColumnDef<PagesResponseWithAuthor>[] = [
  {
    accessorKey: 'order',
    header: '',
    meta: { sortKey: 'order', tooltip: m['admin.pages.order_tooltip']() },
    cell: ({ row }) => {
      const orderSnippet = createRawSnippet<[{ order: number }]>(getData => {
        const { order } = getData();
        return {
          render: () => `<div class="text-sm text-center font-mono">${order}</div>`,
        };
      });
      return renderSnippet(orderSnippet, {
        order: row.original.order || 0,
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
    cell: ({ row }) => {
      const titleSnippet = createRawSnippet<[{ title: string; id: string; parent: string | null; depth?: number }]>(
        getData => {
          const { title, id, depth = 0 } = getData();
          // Build ascii tree prefix based on depth: repeat vertical bar for ancestors and use └─ for the current level
          let prefix = '';
          if (depth > 0) {
            prefix = '│ '.repeat(Math.max(0, depth - 1)) + '└─';
          }
          return {
            render: () =>
              `<div class="flex items-center"><span class="text-muted-foreground mr-2 font-mono">${prefix}</span><a href="/admin/pages/${id}" class="font-medium hover:underline">${title || '<em>Untitled</em>'}</a></div>`,
          };
        }
      );
      return renderSnippet(titleSnippet, {
        title: row.original.title || '',
        id: row.original.id,
        parent: row.original.parent || null,
        depth: (row.original as any).depth || 0,
      });
    },
  },
  {
    accessorKey: 'slug',
    header: m['admin.pages.slug'](),
    meta: { sortKey: 'slug' },
  },
  {
    accessorKey: 'published',
    header: m['admin.pages.published'](),
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
    accessorKey: 'visible',
    header: m['admin.pages.visible'](),
    cell: ({ row }) => {
      const vis = row.original.visible;
      const comp = vis ? EyeIcon : EyeOffIcon;
      return renderComponent(comp, { class: 'w-5 h-5', 'aria-hidden': true });
    },
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
