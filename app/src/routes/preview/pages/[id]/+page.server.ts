import * as m from '$lib/paraglide/messages';
import { FALLTHROUGH_PAGE_FIELDS, getFallthroughAccessError } from '$lib/server/page-fallthrough';
import type { PagesResponse } from '$lib/types/pocketbase';
import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

const PRIVILEGED_PREVIEW_ROLES = new Set(['admin', 'editor']);

type PreviewPageEvent = RequestEvent & {
  params: {
    id: string;
  };
};

export const load = async ({ params, locals, url }: PreviewPageEvent) => {
  const { pb, user } = locals;

  if (!user) {
    throw error(401, m['error.authentication_required']());
  }

  if (!PRIVILEGED_PREVIEW_ROLES.has(user.role ?? 'user')) {
    throw error(403, 'Forbidden');
  }

  try {
    const page = await pb.collection('pages').getOne<PagesResponse>(params.id, {
      fields: FALLTHROUGH_PAGE_FIELDS,
      expand: 'attachments',
    });

    const accessError = getFallthroughAccessError(page, true);
    if (accessError) {
      throw error(403, m[accessError]());
    }

    return {
      page,
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
      .error('Unable to fetch page preview');

    throw error(404, m['error.page_not_found']());
  }
};
