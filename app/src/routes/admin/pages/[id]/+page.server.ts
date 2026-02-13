import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { pageSchema } from '../schema';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { PagesResponse } from '$lib/types/pocketbase';

export const load: PageServerLoad = async ({ locals, params }) => {
	// Require authentication and editor/admin role
	if (!locals.user) error(401, 'Unauthorized');
	if (locals.user.role !== 'admin' && locals.user.role !== 'editor') {
		error(403, 'Forbidden - Requires editor or admin role');
	}

	try {
		const page = await locals.pb.collection('pages').getOne<PagesResponse>(params.id);

		const form = await superValidate(
			{
				title: page.title || '',
				slug: page.slug,
				summary: page.summary || '',
				content: page.content || '',
				published: page.published || false,
				order: page.order,
				parent: page.parent,
				require_login: page.require_login || false,
				subscriber_only: page.subscriber_only || false,
				custom_css: page.custom_css || ''
			},
			zod4(pageSchema)
		);

		return {
			page,
			form
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
			pbFormData.append('published', form.data.published.toString());
			if (form.data.order !== undefined) pbFormData.append('order', form.data.order.toString());
			if (form.data.parent) pbFormData.append('parent', form.data.parent);
			if (form.data.require_login !== undefined)
				pbFormData.append('require_login', form.data.require_login.toString());
			if (form.data.subscriber_only !== undefined)
				pbFormData.append('subscriber_only', form.data.subscriber_only.toString());
			if (form.data.custom_css) pbFormData.append('custom_css', form.data.custom_css);

			// Handle file upload
			const image = formData.get('image') as File;
			if (image && image.size > 0) {
				pbFormData.append('image', image);
			}

			await locals.pb.collection('pages').update(params.id, pbFormData);

			redirect(303, '/admin/pages');
		} catch (err) {
			const error = err as Error;
			return fail(500, {
				form,
				error: error.message || 'Failed to update page'
			});
		}
	}
};
