import * as m from '$lib/paraglide/messages';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';

const profileSchema = z.object({
	name: z.string().min(2, m['validation.name_min_length']()),
	email: z.email(m['validation.email_invalid']()),
	title: z.string().optional(),
	bio: z.string().optional(),
	website: z.string().url().optional().or(z.literal('')),
	avatar: z.instanceof(File).optional()
});

const twoFactorRequestSchema = z.object({
	// No fields needed - we'll use the logged-in user's email
});

const twoFactorVerifySchema = z.object({
	otpId: z.string(),
	code: z.string().length(6, 'Code must be 6 digits')
});

type ProfileSchema = z.infer<typeof profileSchema>;
type TwoFactorRequestSchema = z.infer<typeof twoFactorRequestSchema>;
type TwoFactorVerifySchema = z.infer<typeof twoFactorVerifySchema>;

export const load: PageServerLoad = async ({ locals }) => {
	// Require authentication
	if (!locals.user) {
		redirect(303, '/login');
	}

	const profileForm = await superValidate<ProfileSchema>(
		{
			name: locals.user.name,
			email: locals.user.email,
			title: locals.user.title || '',
			bio: locals.user.bio || '',
			website: locals.user.website || ''
		},
		zod4(profileSchema)
	);

	const twoFactorRequestForm = await superValidate<TwoFactorRequestSchema>(
		zod4(twoFactorRequestSchema)
	);

	const twoFactorVerifyForm = await superValidate<TwoFactorVerifySchema>(
		zod4(twoFactorVerifySchema)
	);

	// Check if 2FA is enabled
	let twoFactorEnabled = false;
	try {
		const mfas = await locals.pb.collection('_mfas').getFullList({
			filter: `recordRef = "${locals.user.id}" && collectionRef = "users"`
		});
		twoFactorEnabled = mfas.length > 0;
	} catch (err) {
		console.error('Error checking 2FA status:', err);
	}

	return {
		profileForm,
		twoFactorRequestForm,
		twoFactorVerifyForm,
		twoFactorEnabled,
		user: locals.user
	};
};

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const form = await superValidate<ProfileSchema>(formData, zod4(profileSchema));

		if (!form.valid) {
			return fail(400, { profileForm: form });
		}

		try {
			const updateData: Record<string, any> = {
				name: form.data.name,
				email: form.data.email,
				title: form.data.title || '',
				bio: form.data.bio || '',
				website: form.data.website || ''
			};

			// Handle avatar upload
			const avatarFile = formData.get('avatar') as File;
			if (avatarFile && avatarFile.size > 0) {
				updateData.avatar = avatarFile;
			}

			await locals.pb.collection('users').update(locals.user.id, updateData);

			// Refresh user data
			await locals.pb.collection('users').authRefresh();
			locals.user = locals.pb.authStore.record as any;

			return {
				profileForm: form,
				success: true,
				message: m['account.success_message']()
			};
		} catch (err: any) {
			console.error('Profile update error:', err);
			return fail(400, {
				profileForm: form,
				message: err?.message || m['account.error_message']()
			});
		}
	},

	requestTwoFactor: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const form = await superValidate<TwoFactorRequestSchema>(request, zod4(twoFactorRequestSchema));

		if (!form.valid) {
			return fail(400, { twoFactorRequestForm: form });
		}

		try {
			// Request OTP using the logged-in user's email
			const otpResponse = await locals.pb.collection('users').requestOTP(locals.user.email);

			return {
				twoFactorRequestForm: form,
				otpId: otpResponse.otpId,
				otpRequested: true
			};
		} catch (err: any) {
			console.error('OTP request error:', err);
			return fail(400, {
				twoFactorRequestForm: form,
				message: 'Failed to send verification code'
			});
		}
	},

	verifyTwoFactor: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const form = await superValidate<TwoFactorVerifySchema>(request, zod4(twoFactorVerifySchema));

		if (!form.valid) {
			return fail(400, { twoFactorVerifyForm: form });
		}

		try {
			// First, verify the OTP code to ensure the user can receive emails
			// We need to get the OTP record and check if the code matches
			const otps = await locals.pb.collection('_otps').getFullList({
				filter: `id = "${form.data.otpId}" && recordRef = "${locals.user.id}"`
			});

			if (otps.length === 0) {
				return fail(400, {
					twoFactorVerifyForm: form,
					message: 'Invalid or expired OTP'
				});
			}

			const otp = otps[0];

			// Verify the password (OTP code) matches
			// Note: PocketBase hashes the OTP, so we can't directly compare
			// Instead, we'll try to use authWithOTP which will validate it
			try {
				// Create a temporary auth to verify the OTP
				await locals.pb.collection('users').authWithOTP(form.data.otpId, form.data.code);
			} catch (err) {
				return fail(400, {
					twoFactorVerifyForm: form,
					message: 'Invalid verification code'
				});
			}

			// OTP is valid, now create an MFA record for this user
			await locals.pb.collection('_mfas').create({
				collectionRef: 'users',
				recordRef: locals.user.id,
				method: 'otp'
			});

			return {
				twoFactorVerifyForm: form,
				twoFactorEnabled: true,
				success: true,
				message: m['account.2fa_success']()
			};
		} catch (err: any) {
			console.error('MFA setup error:', err);
			return fail(400, {
				twoFactorVerifyForm: form,
				message: m['account.2fa_error']()
			});
		}
	},

	disableTwoFactor: async ({ locals }) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		try {
			// Get all MFA records for this user
			const mfas = await locals.pb.collection('_mfas').getFullList({
				filter: `recordRef = "${locals.user.id}" && collectionRef = "users"`
			});

			// Delete all MFA records
			for (const mfa of mfas) {
				await locals.pb.collection('_mfas').delete(mfa.id);
			}

			return {
				twoFactorEnabled: false,
				success: true,
				message: m['account.2fa_disabled_success']()
			};
		} catch (err: any) {
			console.error('Disable 2FA error:', err);
			return fail(400, {
				message: 'Failed to disable 2FA'
			});
		}
	}
};
