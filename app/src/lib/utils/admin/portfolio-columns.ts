import DataTableActions from '$lib/components/admin/portfolio/data-table-actions.svelte';
import PublishVisibilityCell from '$lib/components/admin/posts/publish-visibility-cell.svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
import type { PortfolioResponseWithExpanded } from '$lib/types/pocketbase-expanded';
import { getFileUrl } from '$lib/utils';
import { formatRelativeTime } from '$lib/utils/relative-time';
import ImageIcon from '@lucide/svelte/icons/image';
import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export const columns: ColumnDef<PortfolioResponseWithExpanded>[] = [
  {
    accessorKey: 'image',
    header: '',
    cell: ({ row }) => {
      const { image, id } = row.original;
      if (!image) {
        return renderComponent(ImageIcon, {
          class: 'h-12 w-12 rounded bg-gray-100 p-2 text-gray-300',
        });
      }

      const imageSnippet = createRawSnippet<[{ imageUrl: string; title: string }]>(getData => {
        const { imageUrl, title } = getData();
        return {
          render: () =>
            `<img src="${escapeHtml(imageUrl)}" alt="Thumbnail for ${escapeHtml(title || 'portfolio item')}" class="h-12 w-12 rounded object-cover" loading="lazy" />`,
        };
      });

      return renderSnippet(imageSnippet, {
        imageUrl: `${getFileUrl('portfolio', id, image)}?thumb=100x100`,
        title: row.original.title || 'portfolio item',
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
            `<a href="/admin/portfolio/${safeId}" class="block max-w-full whitespace-normal wrap-break-word leading-snug font-medium hover:underline" title="${safeTitle}">${safeTitle}</a>`,
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
    accessorKey: 'published',
    header: 'Status',
    cell: ({ row }) =>
      renderComponent(PublishVisibilityCell, {
        published: row.original.published || false,
        visible: row.original.visible || false,
      }),
  },
  {
    accessorKey: 'updated',
    header: 'Updated',
    meta: { sortKey: 'updated' },
    cell: ({ row }) => {
      const updatedSnippet = createRawSnippet<[{ updated: string }]>(getData => {
        const { updated } = getData();
        return {
          render: () => `<div class="truncate text-xs text-foreground">${formatRelativeTime(updated)}</div>`,
        };
      });

      return renderSnippet(updatedSnippet, {
        updated: row.original.updated,
      });
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => renderComponent(DataTableActions, { item: row.original }),
  },
];
