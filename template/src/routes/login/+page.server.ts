import { fail, redirect } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';

const loginSchema = z.object({
	email: z.string().email(m['validation.email_invalid']()),
	password: z.string().min(8, m['validation.password_min_length']())
});

type LoginSchema = z.infer<typeof loginSchema>;

export const load: PageServerLoad = async ({ locals }) => {
	// Redirect if already logged in
	if (locals.user) {
		redirect(303, '/');
	}

	const form = await superValidate<LoginSchema>(zod4(loginSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate<LoginSchema>(request, zod4(loginSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await locals.pb.collection('users').authWithPassword(form.data.email, form.data.password);
		} catch (err) {
			console.error('Login error:', err);
			return fail(400, {
				form,
				message: 'Invalid email or password'
			});
		}

		redirect(303, '/');
	}
};
