import type { PagesResponse } from '$lib/types/pocketbase';
import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { pageSchema } from '../../../../lib/schemas/page';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  // Require authentication and editor/admin role
  if (!locals.user) error(401, 'Unauthorized');
  if (locals.user.role !== 'admin' && locals.user.role !== 'editor') {
    error(403, 'Forbidden - Requires editor or admin role');
  }

  try {
    const page = await locals.pb.collection('pages').getOne<PagesResponse>(params.id);

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

    const form = await superValidate(
      {
        title: page.title || '',
        slug: page.slug,
        summary: page.summary || '',
        content: page.content || '',
        collection: page.collection || '',
        published: page.published || false,
        visible: page.visible || true,
        order: page.order,
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
    };
  } catch (err) {
    error(404, 'Page not found');
  }
};

export const actions: Actions = {
  default: async ({ locals, params, request }) => {
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

      // Handle featured image upload
      const image = formData.get('image') as File;
      if (image && image.size > 0) {
        pbFormData.append('image', image);
      }

      // Handle multiple media files upload
      const mediaFiles = formData.getAll('media') as File[];
      for (const file of mediaFiles) {
        if (file && file.size > 0) {
          pbFormData.append('media', file);
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
};
