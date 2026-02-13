import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
import type { PagesResponse } from '$lib/types/pocketbase';
import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import DataTableActions from './data-table-actions.svelte';

export const columns: ColumnDef<PagesResponse>[] = [
  {
    accessorKey: 'image',
    header: '',
    cell: ({ row }) => {
      const imageSnippet = createRawSnippet<[{ image: string | null; id: string }]>(getData => {
        const { image, id } = getData();
        if (!image) {
          return { render: () => '<div class="w-12 h-12"></div>' };
        }
        const imageUrl = `http://127.0.0.1:8090/api/files/pages/${id}/${image}?thumb=100x100`;
        return {
          render: () =>
            `<img src="${imageUrl}" alt="Thumbnail" class="w-12 h-12 object-cover rounded" />`,
        };
      });
      return renderSnippet(imageSnippet, {
        image: row.original.image || null,
        id: row.original.id,
      });
    },
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => {
      const titleSnippet = createRawSnippet<[{ title: string; id: string; parent: string | null }]>(
        getData => {
          const { title, id, parent } = getData();
          const indent = parent ? 'ml-6' : '';
          return {
            render: () =>
              `<a href="/admin/pages/${id}" class="font-medium hover:underline ${indent}">${title || '<em>Untitled</em>'}</a>`,
          };
        }
      );
      return renderSnippet(titleSnippet, {
        title: row.original.title || '',
        id: row.original.id,
        parent: row.original.parent || null,
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
    header: 'Date',
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
    header: 'Updated',
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
    accessorKey: 'author',
    header: 'Author',
    cell: ({ row }) => {
      const authorSnippet = createRawSnippet<[{ expand: any }]>(getData => {
        const { expand } = getData();
        const authorName = expand?.author?.name || expand?.author?.email || 'Unknown';
        return {
          render: () => `<div class="text-sm">${authorName}</div>`,
        };
      });
      return renderSnippet(authorSnippet, {
        expand: row.original.expand || {},
      });
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => renderComponent(DataTableActions, { page: row.original }),
  },
];
