import DataTableActions from '$lib/components/admin/posts/data-table-actions.svelte';
import PublishVisibilityCell from '$lib/components/admin/posts/publish-visibility-cell.svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
import { getFileUrl } from '$lib/utils';
import type { PostsResponseWithExpanded } from '$lib/types/pocketbase-expanded';
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

function getTagLabel(tag: unknown): string {
  if (tag && typeof tag === 'object') {
    const tagName = (tag as { tag?: string }).tag;
    const slug = (tag as { slug?: string }).slug;
    return tagName || slug || 'untagged';
  }

  return 'untagged';
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
          class: 'w-8 h-8 text-gray-300 p-2 bg-gray-100 rounded',
        });
      }
      const imageSnippet = createRawSnippet<[{ imageUrl: string; title: string }]>(getData => {
        const { imageUrl, title } = getData();
        return {
          render: () =>
            `<img src="${escapeHtml(imageUrl)}" alt="Thumbnail for ${escapeHtml(title || 'post')}" class="h-12 w-12 min-w-12 rounded object-cover" loading="lazy" />`,
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
            `<a href="/admin/posts/${safeId}" class="block max-w-32 truncate font-medium hover:underline sm:max-w-48 md:max-w-64 lg:max-w-none" title="${safeTitle}">${safeTitle}</a>`,
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
            `<div class="max-w-24 truncate text-sm text-muted-foreground sm:max-w-32 md:max-w-40 lg:max-w-none" title="${safeSlug}">${safeSlug}</div>`,
        };
      });

      return renderSnippet(slugSnippet, {
        slug: row.original.slug || '-',
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
            `<div class="max-w-24 truncate text-sm sm:max-w-32 md:max-w-48 lg:max-w-56" title="${safeLabels}">${safeLabels}</div>`,
        };
      });
      return renderSnippet(authorSnippet, {
        authors: row.original.author || [],
      });
    },
  },
  {
    accessorKey: 'tags',
    header: 'Tags',
    cell: ({ row }) => {
      const tagSnippet = createRawSnippet<[{ tags: unknown[] }]>(getData => {
        const { tags } = getData();
        const labels = tags.map(getTagLabel).join(', ');
        const safeLabels = escapeHtml(labels || 'None');
        return {
          render: () =>
            `<div class="max-w-20 truncate text-sm text-muted-foreground sm:max-w-28 md:max-w-36 lg:max-w-48" title="${safeLabels}">${safeLabels}</div>`,
        };
      });
      return renderSnippet(tagSnippet, {
        tags: row.original.tags || [],
      });
    },
  },
  {
    accessorKey: 'published',
    header: 'Published',
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
          render: () => `<div class="text-sm text-muted-foreground">${formatted}</div>`,
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
    cell: ({ row }) => renderComponent(DataTableActions, { post: row.original }),
  },
];
