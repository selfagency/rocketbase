import * as m from '$lib/paraglide/messages';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';

const loginSchema = z.object({
	email: z.email(m['validation.email_invalid']()),
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
	login: async ({ request, locals }) => {
		const form = await superValidate<LoginSchema>(request, zod4(loginSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await locals.pb.collection('users').authWithPassword(form.data.email, form.data.password);
		} catch (err: any) {
			console.error('Login error:', err);

			// Check if MFA is required
			const mfaId = err?.response?.mfaId;
			if (mfaId) {
				// MFA is required - request OTP and return to show OTP form
				try {
					const otpResponse = await locals.pb.collection('users').requestOTP(form.data.email);
					return {
						form,
						mfaRequired: true,
						mfaId: mfaId,
						otpId: otpResponse.otpId,
						email: form.data.email
					};
				} catch (otpErr) {
					console.error('OTP request error:', otpErr);
					form.message = 'Failed to send verification code';
					return fail(400, { form });
				}
			}

			form.message = 'Invalid email or password';
			return fail(400, { form });
		}

		redirect(303, '/');
	},

	verifyMfa: async ({ request, locals }) => {
		const formData = await request.formData();
		const otpId = formData.get('otpId') as string;
		const code = formData.get('code') as string;
		const mfaId = formData.get('mfaId') as string;
		const email = formData.get('email') as string;

		if (!otpId || !code || !mfaId) {
			return fail(400, { message: 'Missing required fields' });
		}

		try {
			// Authenticate with OTP and include the mfaId to complete MFA flow
			await locals.pb.collection('users').authWithOTP(otpId, code, { mfaId: mfaId });
		} catch (err) {
			console.error('MFA verification error:', err);
			return fail(400, {
				mfaRequired: true,
				mfaId: mfaId,
				otpId: otpId,
				email: email,
				message: 'Invalid verification code'
			});
		}

		redirect(303, '/');
	}
};
