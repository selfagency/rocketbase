import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { pageSchema } from '../schema';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async ({ locals }) => {
	// Require authentication and editor/admin role
	if (!locals.user) error(401, 'Unauthorized');
	if (locals.user.role !== 'admin' && locals.user.role !== 'editor') {
		error(403, 'Forbidden - Requires editor or admin role');
	}

	return {
		form: await superValidate(zod4(pageSchema))
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
			if (form.data.require_login !== undefined)
				pbFormData.append('require_login', form.data.require_login.toString());
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

			const record = await locals.pb.collection('pages').create(pbFormData);

			redirect(303, `/admin/pages/${record.id}`);
		} catch (err) {
			const error = err as Error;
			return fail(500, {
				form,
				error: error.message || 'Failed to create page'
			});
		}
	}
};
