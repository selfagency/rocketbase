import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { pb } = locals;

  try {
    // Fetch users who are likely authors (admin or editor)
    // Or we can just fetch all users and filter those with posts
    const users = await pb.collection('users').getFullList({
      filter: 'role = "admin" || role = "editor" || role = "contributor"',
      sort: 'name',
    });

    // Get post count for each author - including visibility check
    const authorsWithCount = await Promise.all(
      users.map(async author => {
        const count = await pb.collection('posts').getList(1, 1, {
          filter: `author.id ?= "${author.id}" && published = true && visible = true`,
          fields: 'id',
        });
        return {
          ...author,
          postCount: count.totalItems,
        };
      })
    );

    // Only show authors who have posts
    return {
      authors: authorsWithCount.filter(a => a.postCount > 0),
    };
  } catch (err) {
    locals.logger
      .withContext({
        route: '/authors',
        userId: locals.pb?.authStore?.record?.id,
        requestId: locals.requestId,
      })
      .withContext(err as Error)
      .error('Error loading authors');
    return {
      authors: [],
    };
  }
};
