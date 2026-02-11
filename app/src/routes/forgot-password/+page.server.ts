import * as m from '$lib/paraglide/messages.js';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';

const forgotPasswordSchema = z.object({
	email: z.email(m['validation.email_invalid']())
});

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export const load: PageServerLoad = async () => {
	const form = await superValidate<ForgotPasswordSchema>(zod4(forgotPasswordSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const form = await superValidate<ForgotPasswordSchema>(request, zod4(forgotPasswordSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await locals.pb.collection('users').requestPasswordReset(form.data.email);

			return {
				form,
				success: true,
				message: 'If an account exists with this email, a password reset link has been sent.'
			};
		} catch (err) {
			locals.logger
				.withContext({
					route: url.pathname,
					userId: locals.pb?.authStore?.record?.id,
					requestId: locals.requestId
				})
				.withMetadata(err as Error)
				.error('Password reset error');

			// Return success message even on error for security
			// (don't reveal whether email exists)
			return {
				form,
				success: true,
				message: 'If an account exists with this email, a password reset link has been sent.'
			};
		}
	}
};
