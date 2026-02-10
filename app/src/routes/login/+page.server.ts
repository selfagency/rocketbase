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
			const authData = await locals.pb
				.collection('users')
				.authWithPassword(form.data.email, form.data.password);

			// Check if account is disabled
			if (authData.record.disabled) {
				// Clear auth and show error
				locals.pb.authStore.clear();
				form.message = m['auth.login.account_disabled']();
				return fail(403, { form });
			}
		} catch (err: any) {
			console.error('Login error:', err);

			// Check if MFA is required
			const mfaId = err?.response?.mfaId;
			if (mfaId) {
				// MFA is required - request OTP and return to show OTP form
				try {
					console.debug('MFA required, requesting OTP for:', form.data.email);
					console.debug('Using mfaId:', mfaId);

					// Request OTP with mfaId to link to MFA session
					const otpResponse = await locals.pb
						.collection('users')
						.requestOTP(form.data.email, { mfaId } as any);

					console.debug('OTP request successful');
					console.debug('OTP Response:', { otpId: otpResponse.otpId });

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

			form.message = m['auth.login.invalid_credentials']();
			return fail(400, { form });
		}

		redirect(303, '/?login=success');
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
			console.debug('=== MFA Verification Debug ===');
			console.debug('Form data received:', { otpId, code: code?.substring(0, 3) + '***', email });
			console.debug('Code length:', code?.length);

			// authWithOTP signature: authWithOTP(otpId: string, password: string, options?: CommonOptions)
			// The 'password' parameter is actually the OTP code
			console.debug('Calling: pb.collection("users").authWithOTP(otpId, code, { mfaId })');

			const authData = await locals.pb
				.collection('users')
				.authWithOTP(otpId, code, { mfaId } as any);

			console.debug('MFA verification succeeded!');
			console.debug('Auth data received:', {
				userId: authData.record?.id,
				email: authData.record?.email
			});

			// Check if account is disabled after MFA
			if (authData.record.disabled) {
				locals.pb.authStore.clear();
				return fail(403, {
					mfaRequired: true,
					mfaId: mfaId,
					otpId: otpId,
					email: email,
					message: m['auth.login.account_disabled']()
				});
			}

			// Redirect on success - let the auth hook pick up the new auth state
			console.debug('MFA verification successful!');
			redirect(303, '/?login=success');
		} catch (err: any) {
			// Re-throw SvelteKit redirects (they shouldn't be caught as errors)
			if (err?.status && err?.location) {
				throw err;
			}

			console.error('=== MFA verification error ===');
			console.error('Full error object:', err);
			console.error('Error details:', {
				status: err?.status,
				response: err?.response,
				message: err?.message,
				data: err?.data
			});

			return fail(400, {
				mfaRequired: true,
				mfaId: mfaId,
				otpId: otpId,
				email: email,
				message: `Invalid verification code - ${err?.message || 'Unknown error'}`
			});
		}
	}
};
