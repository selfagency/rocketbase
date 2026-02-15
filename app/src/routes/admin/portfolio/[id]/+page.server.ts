import { portfolioSchema } from '$lib/schemas/portfolio';
import type { MediaResponse } from '$lib/types/pocketbase';
import type { PortfolioResponseWithExpanded } from '$lib/types/pocketbase-expanded';
import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.user) error(401, 'Unauthorized');
  if (locals.user.role !== 'admin' && locals.user.role !== 'editor') {
    error(403, 'Forbidden - Requires editor or admin role');
  }

  try {
    const item = await locals.pb.collection('portfolio').getOne<PortfolioResponseWithExpanded>(params.id, {
      expand: 'media',
    });

    const expandedMedia = (item.expand as { media?: MediaResponse[] } | undefined)?.media || [];
    const existingMediaIds = expandedMedia.map(media => media.id);

    const form = await superValidate(
      {
        title: item.title || '',
        slug: item.slug || '',
        summary: item.summary || '',
        description: item.description || '',
        url: item.url || '',
        published: item.published || false,
        visible: item.visible ?? true,
        existingMedia: existingMediaIds,
      },
      zod4(portfolioSchema)
    );

    return {
      item,
      form,
      existingMediaRecords: expandedMedia,
    };
  } catch {
    error(404, 'Portfolio item not found');
  }
};

export const actions: Actions = {
  update: async ({ locals, params, request }) => {
    if (!locals.user) error(401, 'Unauthorized');
    if (locals.user.role !== 'admin' && locals.user.role !== 'editor') {
      error(403, 'Forbidden - Requires editor or admin role');
    }

    const formData = await request.formData();
    const form = await superValidate(formData, zod4(portfolioSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      const pbFormData = new FormData();
      pbFormData.append('title', form.data.title);
      pbFormData.append('slug', form.data.slug);
      if (form.data.summary) pbFormData.append('summary', form.data.summary);
      if (form.data.description) pbFormData.append('description', form.data.description);
      if (form.data.url) pbFormData.append('url', form.data.url);
      pbFormData.append('published', form.data.published.toString());
      pbFormData.append('visible', form.data.visible.toString());

      const image = formData.get('image') as File;
      if (image && image.size > 0) {
        pbFormData.append('image', image);
      }

      const mediaIds = [...(form.data.existingMedia ?? [])];
      const mediaFiles = formData.getAll('media') as File[];

      for (const file of mediaFiles) {
        if (!file || file.size === 0) continue;

        const mediaFormData = new FormData();
        mediaFormData.append('file', file);
        if (locals.user?.id) {
          mediaFormData.append('uploaded_by', locals.user.id);
        }

        const mediaRecord = await locals.pb.collection('media').create(mediaFormData);
        mediaIds.push(mediaRecord.id);
      }

      for (const mediaId of new Set(mediaIds)) {
        if (mediaId) pbFormData.append('media', mediaId);
      }

      await locals.pb.collection('portfolio').update(params.id, pbFormData);
    } catch (err) {
      const pbError = err as Error;
      return fail(500, {
        form,
        error: pbError.message || 'Failed to update portfolio item',
      });
    }

    redirect(303, `/admin/portfolio/${params.id}`);
  },
};
