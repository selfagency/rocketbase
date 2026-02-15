import DataTableActions from '$lib/components/admin/posts/data-table-actions.svelte';
import PublishVisibilityCell from '$lib/components/admin/posts/publish-visibility-cell.svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
import type { PostsResponseWithExpanded } from '$lib/types/pocketbase-expanded';
import { getFileUrl } from '$lib/utils';
import { formatRelativeTime } from '$lib/utils/relative-time';
import ImageIcon from '@lucide/svelte/icons/image';
import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';

function getAuthorLabel(author: unknown): string {
  if (author && typeof author === 'object') {
    const name = (author as { name?: string }).name;
    const email = (author as { email?: string }).email;
    return name || email || 'Unknown';
  }

  return 'Unknown';
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export const columns: ColumnDef<PostsResponseWithExpanded>[] = [
  {
    accessorKey: 'image',
    header: '',
    cell: ({ row }) => {
      const { image, id } = row.original as any;
      if (!image) {
        return renderComponent(ImageIcon, {
          class: 'h-12 w-12 rounded bg-gray-100 p-2 text-gray-300',
        });
      }
      const imageSnippet = createRawSnippet<[{ imageUrl: string; title: string }]>(getData => {
        const { imageUrl, title } = getData();
        return {
          render: () =>
            `<img src="${escapeHtml(imageUrl)}" alt="Thumbnail for ${escapeHtml(title || 'post')}" class="h-12 w-12 rounded object-cover" loading="lazy" />`,
        };
      });

      return renderSnippet(imageSnippet, {
        imageUrl: `${getFileUrl('posts', id, image)}?thumb=100x100`,
        title: row.original.title || 'post',
      });
    },
  },
  {
    accessorKey: 'title',
    header: 'Title',
    meta: { sortKey: 'title' },
    cell: ({ row }) => {
      const titleSnippet = createRawSnippet<[{ title: string; id: string }]>(getData => {
        const { title, id } = getData();
        const safeTitle = escapeHtml(title || 'Untitled');
        const safeId = escapeHtml(id);

        return {
          render: () =>
            `<a href="/admin/posts/${safeId}" class="block max-w-full whitespace-normal wrap-break-word leading-snug font-medium hover:underline" title="${safeTitle}">${safeTitle}</a>`,
        };
      });

      return renderSnippet(titleSnippet, {
        title: row.original.title || 'Untitled',
        id: row.original.id,
      });
    },
  },
  {
    accessorKey: 'slug',
    header: 'Slug',
    meta: { sortKey: 'slug' },
    cell: ({ row }) => {
      const slugSnippet = createRawSnippet<[{ slug: string }]>(getData => {
        const { slug } = getData();
        const safeSlug = escapeHtml(slug || '-');
        return {
          render: () =>
            `<div class="max-w-full truncate text-xs text-foreground" title="${safeSlug}">${safeSlug}</div>`,
        };
      });

      return renderSnippet(slugSnippet, {
        slug: row.original.slug || '-',
      });
    },
  },
  {
    accessorKey: 'summary',
    header: 'Summary',
    meta: { sortKey: 'summary' },
    cell: ({ row }) => {
      const summarySnippet = createRawSnippet<[{ summary: string }]>(getData => {
        const { summary } = getData();
        const safeSummary = escapeHtml(summary || '-');
        return {
          render: () =>
            `<div class="max-w-full truncate text-xs text-foreground" title="${safeSummary}">${safeSummary}</div>`,
        };
      });

      return renderSnippet(summarySnippet, {
        summary: row.original.summary || '-',
      });
    },
  },
  {
    accessorKey: 'author',
    header: 'Authors',
    meta: { sortKey: 'author' },
    cell: ({ row }) => {
      const authorSnippet = createRawSnippet<[{ authors: unknown[] }]>(getData => {
        const { authors } = getData();
        const labels = authors.map(getAuthorLabel).join(', ') || 'Unknown';
        const safeLabels = escapeHtml(labels);
        return {
          render: () =>
            `<div class="max-w-full whitespace-normal wrap-break-word text-xs leading-snug text-foreground" title="${safeLabels}">${safeLabels}</div>`,
        };
      });
      return renderSnippet(authorSnippet, {
        authors: row.original.author || [],
      });
    },
  },
  {
    accessorKey: 'published',
    header: 'Status',
    cell: ({ row }) =>
      renderComponent(PublishVisibilityCell, {
        published: row.original.published || false,
        visible: row.original.visible || false,
      }),
  },
  {
    accessorKey: 'date',
    header: 'Date',
    meta: { sortKey: 'date' },
    cell: ({ row }) => {
      const dateSnippet = createRawSnippet<[{ date: string }]>(getData => {
        const { date } = getData();
        const formatted = date ? new Date(date).toLocaleDateString() : '-';
        return {
          render: () => `<div class="truncate text-xs text-foreground">${formatted}</div>`,
        };
      });
      return renderSnippet(dateSnippet, {
        date: row.original.date,
      });
    },
  },
  {
    accessorKey: 'updated',
    header: 'Updated',
    meta: { sortKey: 'updated' },
    cell: ({ row }) => {
      const dateSnippet = createRawSnippet<[{ updated: string }]>(getData => {
        const { updated } = getData();
        const formatted = formatRelativeTime(updated);
        return {
          render: () => `<div class="truncate text-xs text-foreground">${formatted}</div>`,
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
    cell: ({ row }) => renderComponent(DataTableActions, { post: row.original }),
  },
];
