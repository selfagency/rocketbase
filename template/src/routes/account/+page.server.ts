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

type ProfileSchema = z.infer<typeof profileSchema>;

// Roles that require MFA per PocketBase collection config
const MFA_REQUIRED_ROLES = ['admin', 'editor', 'contributor'];

export const load: PageServerLoad = async ({ locals }) => {
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
		zod4(profileSchema),
		{ id: 'profileForm' }
	);

	// MFA is enforced automatically by PocketBase based on the user's role
	const mfaRequired = MFA_REQUIRED_ROLES.includes(locals.user.role || '');
	const mfaOptIn = Boolean((locals.user as { mfaOptIn?: boolean }).mfaOptIn);
	const mfaEnabled = mfaRequired || mfaOptIn;

	return {
		profileForm,
		mfaRequired,
		mfaOptIn,
		mfaEnabled,
		user: locals.user
	};
};

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const form = await superValidate<ProfileSchema>(formData, zod4(profileSchema), {
			id: 'profileForm'
		});

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

			// Re-validate with the latest data from the database
			const updatedForm = await superValidate<ProfileSchema>(
				{
					name: locals.user?.name,
					email: locals.user?.email,
					title: locals.user?.title || '',
					bio: locals.user?.bio || '',
					website: locals.user?.website || ''
				},
				zod4(profileSchema),
				{ id: 'profileForm' }
			);

			return {
				profileForm: updatedForm,
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

	toggleMfaOptIn: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const nextOptIn = formData.get('mfaOptIn') === 'true';
		const mfaRequired = MFA_REQUIRED_ROLES.includes(locals.user.role || '');

		if (mfaRequired && !nextOptIn) {
			return fail(400, { message: m['account.error_message']() });
		}

		try {
			await locals.pb.collection('users').update(locals.user.id, {
				mfaOptIn: nextOptIn
			});

			await locals.pb.collection('users').authRefresh();
			locals.user = locals.pb.authStore.record as any;

			return {
				success: true,
				mfaOptIn: nextOptIn,
				mfaEnabled: mfaRequired || nextOptIn
			};
		} catch (err: any) {
			console.error('MFA opt-in update error:', err);
			return fail(400, { message: m['account.error_message']() });
		}
	}
};
