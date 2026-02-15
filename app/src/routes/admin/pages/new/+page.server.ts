import { pageSchema } from '$lib/schemas/page';
import { env } from '$env/dynamic/private';
import type { PagesResponse } from '$lib/types/pocketbase';
import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // Require authentication and editor/admin role
  if (!locals.user) error(401, 'Unauthorized');
  if (locals.user.role !== 'admin' && locals.user.role !== 'editor') {
    error(403, 'Forbidden - Requires editor or admin role');
  }

  // Fetch all pages for parent selection
  const pages = await locals.pb.collection('pages').getFullList<PagesResponse>({
    sort: 'title',
    fields: 'id,title,slug,parent',
  });

  return {
    form: await superValidate(zod4(pageSchema)),
    availableParents: pages,
    pexelsEnabled: Boolean(env.PEXELS_API_KEY),
  };
};

export const actions: Actions = {
  default: async ({ locals, request }) => {
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

      const record = await locals.pb.collection('pages').create(pbFormData);

      redirect(303, `/admin/pages/${record.id}`);
    } catch (err) {
      const error = err as Error;
      return fail(500, {
        form,
        error: error.message || 'Failed to create page',
      });
    }
  },
};
