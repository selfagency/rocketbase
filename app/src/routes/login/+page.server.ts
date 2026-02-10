import * as m from '$lib/paraglide/messages';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';

const loginSchema = z.object({
  email: z.email(m['validation.email_invalid']()),
  password: z.string().min(8, m['validation.password_min_length']()),
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
      const authData = await locals.pb.collection('users').authWithPassword(form.data.email, form.data.password);

      // Check if account is disabled
      if (authData.record.disabled) {
        // Clear auth and show error
        locals.pb.authStore.clear();
        form.message = m['auth.login.account_disabled']();
        return fail(403, { form });
      }
    } catch (err: any) {
      locals.logger.withMetadata(err).error('Login error:');

      // Check if MFA is required
      const mfaId = err?.response?.mfaId;
      if (mfaId) {
        // MFA is required - request OTP and return to show OTP form
        try {
          locals.logger.withMetadata({ email: form.data.email }).debug('MFA required, requesting OTP for');
          locals.logger.withMetadata({ mfaId }).debug('Using mfaId');

          // Request OTP with mfaId to link to MFA session
          const otpResponse = await locals.pb.collection('users').requestOTP(form.data.email, { mfaId } as any);

          locals.logger.debug('OTP request successful');
          locals.logger.withMetadata({ otpId: otpResponse.otpId }).debug('OTP Response');

          return {
            form,
            mfaRequired: true,
            mfaId: mfaId,
            otpId: otpResponse.otpId,
            email: form.data.email,
          };
        } catch (otpErr) {
          locals.logger.withMetadata({ error: otpErr }).error('OTP request error');
          form.message = m['auth.mfa_send_failed']();
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
      return fail(400, { message: m['auth.missing_fields']() });
    }

    try {
      locals.logger.debug('=== MFA Verification Debug ===');
      locals.logger.withMetadata({ otpId, code: code?.substring(0, 3) + '***', email }).debug('Form data received');
      locals.logger.withMetadata({ codeLength: code?.length }).debug('Code length');

      // authWithOTP signature: authWithOTP(otpId: string, password: string, options?: CommonOptions)
      // The 'password' parameter is actually the OTP code
      locals.logger.debug('Calling: pb.collection("users").authWithOTP(otpId, code, { mfaId })');

      const authData = await locals.pb.collection('users').authWithOTP(otpId, code, { mfaId } as any);

      locals.logger.debug('MFA verification succeeded!');
      locals.logger
        .withMetadata({
          userId: authData.record?.id,
          email: authData.record?.email,
        })
        .debug('MFA verification succeeded!');

      // Check if account is disabled after MFA
      if (authData.record.disabled) {
        locals.pb.authStore.clear();
        return fail(403, {
          mfaRequired: true,
          mfaId: mfaId,
          otpId: otpId,
          email: email,
          message: m['auth.login.account_disabled'](),
        });
      }

      // Redirect on success - let the auth hook pick up the new auth state
      locals.logger.debug('MFA verification successful!');
      redirect(303, '/?login=success');
    } catch (err: any) {
      // Re-throw SvelteKit redirects (they shouldn't be caught as errors)
      if (err?.status && err?.location) {
        throw err;
      }

      locals.logger.withMetadata(err).error('=== MFA verification error ===');
      locals.logger
        .withMetadata({
          status: err?.status,
          response: err?.response,
          message: err?.message,
          data: err?.data,
        })
        .error('Error details');

      return fail(400, {
        mfaRequired: true,
        mfaId: mfaId,
        otpId: otpId,
        email: email,
        message: `${m['auth.mfa_invalid_code']()} - ${err?.message || 'Unknown error'}`,
      });
    }
  },
};
