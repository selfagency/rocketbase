import * as m from '$lib/paraglide/messages.js';
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
  website: z.url().optional().or(z.literal('')),
  avatar: z.instanceof(File).optional(),
});

const passwordSchema = z
  .object({
    oldPassword: z.string().min(8, m['validation.password_min_length']()),
    password: z.string().min(8, m['validation.password_min_length']()),
    passwordConfirm: z.string().min(8, m['validation.password_min_length']()),
  })
  .refine(data => data.password === data.passwordConfirm, {
    message: m['validation.password_mismatch'](),
    path: ['passwordConfirm'],
  });

type ProfileSchema = z.infer<typeof profileSchema>;
type PasswordSchema = z.infer<typeof passwordSchema>;

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
      website: locals.user.website || '',
    },
    zod4(profileSchema),
    { id: 'profileForm' }
  );

  const passwordForm = await superValidate<PasswordSchema>(zod4(passwordSchema), {
    id: 'passwordForm',
  });

  // MFA is enforced automatically by PocketBase based on the user's role
  const mfaRequired = MFA_REQUIRED_ROLES.includes(locals.user.role || '');
  const mfaOptIn = Boolean((locals.user as { mfaOptIn?: boolean }).mfaOptIn);
  const mfaEnabled = mfaRequired || mfaOptIn;

  return {
    profileForm,
    passwordForm,
    mfaRequired,
    mfaOptIn,
    mfaEnabled,
    user: locals.user,
  };
};

export const actions: Actions = {
  updateProfile: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { message: m['auth.unauthorized']() });
    }

    const formData = await request.formData();
    const form = await superValidate<ProfileSchema>(formData, zod4(profileSchema), {
      id: 'profileForm',
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
        website: form.data.website || '',
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
          website: locals.user?.website || '',
        },
        zod4(profileSchema),
        { id: 'profileForm' }
      );

      return {
        profileForm: updatedForm,
        success: true,
        message: m['account.success_message'](),
      };
    } catch (err: any) {
      locals.logger.withMetadata(err).error('Profile update error:');
      return fail(400, {
        profileForm: form,
        message: err?.message || m['account.error_message'](),
      });
    }
  },

  toggleMfaOptIn: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { message: m['auth.unauthorized']() });
    }

    const formData = await request.formData();
    const nextOptIn = formData.get('mfaOptIn') === 'true';
    const mfaRequired = MFA_REQUIRED_ROLES.includes(locals.user.role || '');

    if (mfaRequired && !nextOptIn) {
      return fail(400, { message: m['account.error_message']() });
    }

    try {
      await locals.pb.collection('users').update(locals.user.id, {
        mfaOptIn: nextOptIn,
      });

      await locals.pb.collection('users').authRefresh();
      locals.user = locals.pb.authStore.record as any;

      return {
        success: true,
        mfaOptIn: nextOptIn,
        mfaEnabled: mfaRequired || nextOptIn,
      };
    } catch (err: any) {
      locals.logger.withMetadata(err).error('MFA opt-in update error:');
      return fail(400, { message: m['account.error_message']() });
    }
  },

  sendVerificationEmail: async ({ locals }) => {
    if (!locals.user) {
      return fail(401, { message: m['auth.unauthorized']() });
    }

    try {
      await locals.pb.collection('users').requestVerification(locals.user.email);
      return {
        success: true,
        message: m['account.email_verification_sent'](),
      };
    } catch (err: any) {
      locals.logger.withMetadata(err).error('Email verification error:');
      const message = err?.data?.message || err?.message || m['account.error_message']();
      return fail(400, { message });
    }
  },

  changePassword: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { message: m['auth.unauthorized']() });
    }

    const formData = await request.formData();
    const form = await superValidate<PasswordSchema>(formData, zod4(passwordSchema), {
      id: 'passwordForm',
    });

    if (!form.valid) {
      return fail(400, { passwordForm: form });
    }

    try {
      // Update password with old password verification
      // PocketBase validates oldPassword internally, keeping auth state intact
      await locals.pb.collection('users').update(locals.user.id, {
        oldPassword: form.data.oldPassword,
        password: form.data.password,
        passwordConfirm: form.data.passwordConfirm,
      });

      // Refresh auth to maintain session with new password
      // Password update clears auth, so we need to re-authenticate
      await locals.pb.collection('users').authWithPassword(locals.user.email, form.data.password);
      locals.user = locals.pb.authStore.record as any;

      return {
        passwordForm: await superValidate<PasswordSchema>(zod4(passwordSchema), {
          id: 'passwordForm',
        }),
        success: true,
        message: 'Password changed successfully',
      };
    } catch (err: any) {
      locals.logger.withMetadata(err).error('Password change error:');
      // Check if it's an old password validation error
      if (
        err?.message?.toLowerCase().includes('old password') ||
        err?.message?.toLowerCase().includes('oldpassword') ||
        err?.data?.data?.oldPassword
      ) {
        form.message = 'Invalid current password';
      } else {
        form.message = err?.message || m['account.error_message']();
      }
      return fail(400, { passwordForm: form });
    }
  },

  requestTwoFactor: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { message: m['auth.unauthorized']() });
    }

    try {
      const formData = await request.formData();
      // oxlint-disable-next-line typescript/no-base-to-string
      const email = formData.get('email')?.toString() || locals.user.email;

      const response = await locals.pb.collection('users').requestOTP(email);

      return {
        otpId: response.otpId,
        otpRequested: true,
      };
    } catch (err: any) {
      locals.logger.withMetadata(err).error('OTP request error:');
      return fail(400, { message: err?.message || m['account.error_message']() });
    }
  },

  verifyTwoFactor: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { message: m['auth.unauthorized']() });
    }

    try {
      const formData = await request.formData();
      // oxlint-disable-next-line typescript/no-base-to-string
      const otpId = formData.get('otpId')?.toString();
      // oxlint-disable-next-line typescript/no-base-to-string
      const code = formData.get('code')?.toString();

      if (!otpId || !code) {
        return fail(400, { message: m['auth.missing_otp']() });
      }

      // Verify the OTP code
      const otps = await locals.pb
        .collection('_otps')
        .getFullList({ filter: `id = "${otpId}" && recordRef = "${locals.user.id}"` });

      if (otps.length === 0) {
        return fail(400, { message: m['auth.invalid_otp']() });
      }

      // Authenticate with OTP to verify the code
      await locals.pb.collection('users').authWithOTP(otpId, code);

      // Create MFA record
      await locals.pb.collection('_mfas').create({
        collectionRef: 'users',
        recordRef: locals.user.id,
        method: 'otp',
      });

      return {
        twoFactorEnabled: true,
        success: true,
      };
    } catch (err: any) {
      locals.logger.withMetadata(err).error('2FA verification error:');
      return fail(400, { message: err?.message || m['auth.invalid_code']() });
    }
  },

  disableTwoFactor: async ({ locals }) => {
    if (!locals.user) {
      return fail(401, { message: m['auth.unauthorized']() });
    }

    try {
      // Get all MFA records for this user
      const mfas = await locals.pb.collection('_mfas').getFullList({ filter: `recordRef = "${locals.user.id}"` });

      // Delete all MFA records
      for (const mfa of mfas) {
        await locals.pb.collection('_mfas').delete(mfa.id);
      }

      return {
        twoFactorEnabled: false,
        success: true,
      };
    } catch (err: any) {
      locals.logger.withMetadata(err).error('2FA disable error:');
      return fail(400, { message: err?.message || m['account.error_message']() });
    }
  },
};
