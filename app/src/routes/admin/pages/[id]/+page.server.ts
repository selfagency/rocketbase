import { pageSchema } from '$lib/schemas/page';
import { env } from '$env/dynamic/private';
import { getRestoreSnapshot, getRevisionHistory } from '$lib/server/revision-history';
import type { PagesResponse, UsersResponse } from '$lib/types/pocketbase';
import type { AuditSnapshot } from '$lib/types/revision-history';
import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';

// Helper function to get all descendant page IDs
function getDescendantIds(pageId: string, allPages: PagesResponse[]): Set<string> {
  const descendants = new Set<string>();
  const queue = [pageId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    descendants.add(currentId);

    // Find all children of current page
    const children = allPages.filter(p => p.parent === currentId);
    for (const child of children) {
      if (!descendants.has(child.id)) {
        queue.push(child.id);
      }
    }
  }

  return descendants;
}

function ensureEditorAccess(user: UsersResponse | null) {
  if (!user) error(401, 'Unauthorized');
  if (user.role !== 'admin' && user.role !== 'editor') {
    error(403, 'Forbidden - Requires editor or admin role');
  }
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;

  return value
    .map(item => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object' && 'id' in item) {
        const id = (item as { id?: string }).id;
        return id || '';
      }

      return '';
    })
    .filter(Boolean);
}

function asNumber(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.floor(value));
}

function buildPageRestorePayload(snapshot: AuditSnapshot): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  const title = asString(snapshot.title);
  if (title !== undefined) payload.title = title;

  const slug = asString(snapshot.slug);
  if (slug !== undefined) payload.slug = slug;

  payload.summary = asString(snapshot.summary) ?? '';

  payload.content = asString(snapshot.content) ?? '';

  payload.collection = asString(snapshot.collection) ?? '';

  payload.parent = asString(snapshot.parent) ?? '';

  payload.custom_css = asString(snapshot.custom_css) ?? '';

  const published = asBoolean(snapshot.published);
  if (published !== undefined) payload.published = published;

  const visible = asBoolean(snapshot.visible);
  if (visible !== undefined) payload.visible = visible;

  const requireLogin = asBoolean(snapshot.require_login);
  if (requireLogin !== undefined) payload.require_login = requireLogin;

  const subscriberOnly = asBoolean(snapshot.subscriber_only);
  if (subscriberOnly !== undefined) payload.subscriber_only = subscriberOnly;

  const inTrash = asBoolean(snapshot.in_trash);
  if (inTrash !== undefined) payload.in_trash = inTrash;

  const order = asNumber(snapshot.order);
  if (order !== undefined) payload.order = order;

  payload.attachments = asStringArray(snapshot.attachments) ?? [];

  return payload;
}

export const load: PageServerLoad = async ({ locals, params }) => {
  ensureEditorAccess(locals.user);

  try {
    const [page, allPages, revisions] = await Promise.all([
      locals.pb.collection('pages').getOne<PagesResponse>(params.id),
      locals.pb.collection('pages').getFullList<PagesResponse>({
        sort: 'title',
        fields: 'id,title,slug,parent',
      }),
      getRevisionHistory(locals.pb, 'pages', params.id),
    ]);

    // Get descendant IDs to exclude (prevent circular references)
    const excludedIds = getDescendantIds(params.id, allPages);

    // Filter out current page and its descendants
    const availableParents = allPages.filter(p => !excludedIds.has(p.id));

    // Fetch parent page if exists to get its slug
    let parentSlug: string | null = null;
    if (page.parent) {
      try {
        const parentPage = await locals.pb.collection('pages').getOne<PagesResponse>(page.parent, { fields: 'slug' });
        parentSlug = parentPage.slug;
      } catch {
        // Parent not found, ignore
      }
    }

    const collection = page.collection === 'posts' || page.collection === 'tags' ? page.collection : undefined;

    const form = await superValidate(
      {
        title: page.title || '',
        slug: page.slug,
        summary: page.summary || '',
        content: page.content || '',
        collection,
        published: page.published || false,
        visible: page.visible || true,
        order: page.order,
        attachments: page.attachments || [],
        parent: page.parent,
        require_login: page.require_login || false,
        subscriber_only: page.subscriber_only || false,
        custom_css: page.custom_css || '',
      },
      zod4(pageSchema)
    );

    return {
      page,
      form,
      parentSlug,
      availableParents,
      revisions,
      pexelsEnabled: Boolean(env.PEXELS_API_KEY),
    };
  } catch {
    error(404, 'Page not found');
  }
};

export const actions: Actions = {
  default: async ({ locals, params, request }) => {
    ensureEditorAccess(locals.user);

    const formData = await request.formData();
    const form = await superValidate(formData, zod4(pageSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      // Create FormData for PocketBase (handles file uploads)
      const pbFormData = new FormData();
      pbFormData.append('title', form.data.title);
      pbFormData.append('slug', form.data.slug);
      if (form.data.summary) pbFormData.append('summary', form.data.summary);
      if (form.data.content) pbFormData.append('content', form.data.content);
      if (form.data.collection) pbFormData.append('collection', form.data.collection);
      pbFormData.append('published', form.data.published.toString());
      pbFormData.append('visible', form.data.visible.toString());
      if (form.data.order !== undefined) pbFormData.append('order', form.data.order.toString());
      if (form.data.parent) pbFormData.append('parent', form.data.parent);
      if (form.data.require_login !== undefined) pbFormData.append('require_login', form.data.require_login.toString());
      if (form.data.subscriber_only !== undefined)
        pbFormData.append('subscriber_only', form.data.subscriber_only.toString());
      if (form.data.custom_css) pbFormData.append('custom_css', form.data.custom_css);

      const image = formData.get('image') as File;
      if (image && image.size > 0) {
        pbFormData.append('image', image);
      }

      const attachmentIds = [...(form.data.attachments ?? [])];
      const mediaFiles = formData.getAll('media') as File[];
      for (const file of mediaFiles) {
        if (!file || file.size === 0) continue;

        const mediaFormData = new FormData();
        mediaFormData.append('file', file);
        if (locals.user?.id) {
          mediaFormData.append('uploaded_by', locals.user.id);
        }

        const mediaRecord = await locals.pb.collection('media').create(mediaFormData);
        attachmentIds.push(mediaRecord.id);
      }

      for (const attachmentId of [...new Set(attachmentIds)]) {
        if (attachmentId) {
          pbFormData.append('attachments', attachmentId);
        }
      }

      await locals.pb.collection('pages').update(params.id, pbFormData);

      redirect(303, '/admin/pages');
    } catch (err) {
      const error = err as Error;
      return fail(500, {
        form,
        error: error.message || 'Failed to update page',
      });
    }
  },

  restoreRevision: async ({ locals, params, request }) => {
    ensureEditorAccess(locals.user);

    const formData = await request.formData();
    const revisionId = formData.get('revisionId');

    if (typeof revisionId !== 'string' || !revisionId.trim()) {
      return fail(400, { error: 'A valid revision is required.' });
    }

    try {
      const revision = await locals.pb.collection('audit_logs').getOne(revisionId, {
        fields: 'id,event_type,collection_name,record_id,before_changes,after_changes,timestamp,created',
      });

      if (revision.collection_name !== 'pages' || revision.record_id !== params.id) {
        return fail(404, { error: 'Revision not found for this page.' });
      }

      if (revision.event_type !== 'create' && revision.event_type !== 'update') {
        return fail(400, { error: 'Only create/update revisions can be restored.' });
      }

      const snapshot = getRestoreSnapshot({
        id: revision.id,
        eventType: revision.event_type,
        timestamp: revision.timestamp,
        created: revision.created,
        authorId: null,
        authorName: 'System',
        authorEmail: null,
        before: (revision.before_changes as AuditSnapshot | null) || null,
        after: (revision.after_changes as AuditSnapshot | null) || null,
      });

      if (!snapshot) {
        return fail(400, { error: 'No snapshot data found for the selected revision.' });
      }

      const payload = buildPageRestorePayload(snapshot);

      if (!payload.title || !payload.slug) {
        return fail(400, { error: 'Revision is missing required page fields and cannot be restored.' });
      }

      await locals.pb.collection('pages').update(params.id, payload);
    } catch (err) {
      const pbError = err as Error;
      return fail(500, { error: pbError.message || 'Failed to restore revision.' });
    }

    redirect(303, `/admin/pages/${params.id}`);
  },
};
