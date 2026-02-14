import type { PostsResponseWithExpanded } from '$lib/types/pocketbase-expanded';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

function normalizeExpandedList(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.user) error(401, 'Unauthorized');
  if (locals.user.role !== 'admin' && locals.user.role !== 'editor') {
    error(403, 'Forbidden - Requires editor or admin role');
  }

  const page = parseInt(url.searchParams.get('page') || '1');
  const perPage = parseInt(url.searchParams.get('perPage') || '10');
  const search = url.searchParams.get('search') || '';
  const status = url.searchParams.get('status') || 'all';
  const sort = url.searchParams.get('sort') || '-date';
  const author = url.searchParams.get('author') || '';

  const filters: string[] = [];

  // Handle trash filter separately
  if (status === 'trash') {
    // Only show trashed items, ignore other filters for simplicity
    filters.push('in_trash = true');
  } else {
    // Exclude trashed items from all other views
    filters.push('in_trash != true');

    if (status === 'draft') {
      filters.push('published = false');
    } else if (status === 'published') {
      filters.push('published = true');
    }

    // Only apply search and author filters when NOT viewing trash
    if (search) {
      filters.push(`title ~ "${search}" || slug ~ "${search}" || summary ~ "${search}"`);
    }

    if (author) {
      filters.push(`author ~ "${author}"`);
    }
  }

  const filter = filters.length > 0 ? filters.join(' && ') : '';

  const result = await locals.pb.collection('posts').getList<PostsResponseWithExpanded>(page, perPage, {
    sort,
    filter,
    expand: 'author,tags,attachments',
  });

  const allUsers = await locals.pb.collection('users').getFullList({
    filter: 'role != "user"',
    fields: 'id,name,email',
  });

  const authorsMap = new Map<string, { id: string; name: string }>();
  for (const user of allUsers) {
    authorsMap.set(user.id, {
      id: user.id,
      name: user.name || user.email || 'Unknown',
    });
  }

  const posts: PostsResponseWithExpanded[] = result.items.map(postItem => {
    const expandedAuthor = normalizeExpandedList((postItem as any).expand?.author);
    const expandedTags = normalizeExpandedList((postItem as any).expand?.tags);

    return {
      ...postItem,
      author: expandedAuthor.length > 0 ? (expandedAuthor as any) : (postItem.author as any) || [],
      tags: expandedTags.length > 0 ? (expandedTags as any) : (postItem.tags as any) || [],
    };
  });

  return {
    posts,
    authors: Array.from(authorsMap.values()),
    totalPages: result.totalPages,
    page: result.page,
    perPage: result.perPage,
    totalItems: result.totalItems,
    status,
    selectedAuthor: author,
  };
};

export const actions: Actions = {
  delete: async ({ locals, request }) => {
    const data = await request.formData();
    // oxlint-disable-next-line typescript/no-base-to-string
    const id = data.get('id')?.toString();

    if (!id) {
      return fail(400, { error: 'Missing post ID' });
    }

    try {
      // Soft delete: move to trash instead of hard delete
      await locals.pb.collection('posts').update(id, {
        published: false,
        visible: false,
        require_login: false,
        subscriber_only: false,
        in_trash: true,
      });
      return { success: true };
    } catch (err) {
      const pbError = err as Error;
      return fail(500, { error: pbError.message || 'Failed to delete post' });
    }
  },

  undelete: async ({ locals, request }) => {
    const data = await request.formData();
    // oxlint-disable-next-line typescript/no-base-to-string
    const id = data.get('id')?.toString();

    if (!id) {
      return fail(400, { error: 'Missing post ID' });
    }

    try {
      // Restore from trash: set in_trash to false
      await locals.pb.collection('posts').update(id, {
        in_trash: false,
      });
      return { success: true };
    } catch (err) {
      const pbError = err as Error;
      return fail(500, { error: pbError.message || 'Failed to restore post' });
    }
  },
};
