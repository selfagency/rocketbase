import * as m from '$lib/paraglide/messages';
import type { PostsResponseWithExpanded } from '$lib/types/pocketbase-expanded';
import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

const PRIVILEGED_PREVIEW_ROLES = new Set(['admin', 'editor']);

function getPostAuthorIds(post: PostsResponseWithExpanded): string[] {
  const authorFromRecord = Array.isArray(post.author)
    ? post.author
        .map(author => {
          if (typeof author === 'string') {
            return author;
          }

          if (author && typeof author === 'object' && 'id' in author && typeof author.id === 'string') {
            return author.id;
          }

          return undefined;
        })
        .filter((id): id is string => Boolean(id))
    : [];

  const authorFromExpand = Array.isArray(post.expand?.author)
    ? post.expand.author
        .map(author => {
          if (author && typeof author === 'object' && 'id' in author && typeof author.id === 'string') {
            return author.id;
          }

          return undefined;
        })
        .filter((id): id is string => Boolean(id))
    : [];

  return [...new Set([...authorFromRecord, ...authorFromExpand])];
}

type PreviewPostEvent = RequestEvent & {
  params: {
    slug: string;
  };
};

export const load = async ({ params, locals, url }: PreviewPostEvent) => {
  const { pb, user } = locals;

  if (!user) {
    throw error(401, m['error.authentication_required']());
  }

  const role = user.role ?? 'user';

  try {
    const post = await pb.collection('posts').getFirstListItem<PostsResponseWithExpanded>(`slug = "${params.slug}"`, {
      expand: 'author,tags',
    });

    if (!PRIVILEGED_PREVIEW_ROLES.has(role)) {
      const authorIds = getPostAuthorIds(post);
      const isAuthor = authorIds.includes(user.id);

      if (!isAuthor) {
        throw error(403, 'Forbidden');
      }
    }

    return {
      post,
    };
  } catch (err) {
    if (typeof err === 'object' && err !== null && 'status' in err) {
      throw err;
    }

    locals.logger
      .withContext({
        route: url.pathname,
        userId: locals.pb?.authStore?.record?.id,
        requestId: locals.requestId,
      })
      .withMetadata(err as Error)
      .error('Unable to fetch post preview');

    throw error(404, m['error.post_not_found']());
  }
};
