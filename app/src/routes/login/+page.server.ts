import * as m from '$lib/paraglide/messages.js';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';

const loginSchema = z.object({
  email: z.string().optional(),
  password: z.string().optional(),
  code: z.string().optional(),
  mfaId: z.string().optional(),
  otpId: z.string().optional(),
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
  login: async ({ request, locals, url }) => {
    const form = await superValidate(request, zod4(loginSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const { email, password, code, mfaId, otpId } = form.data;
    const usersCollection = locals.pb.collection('users');

    // If code is provided, user is completing MFA
    if (code) {
      if (!email || !password || !otpId || !mfaId) {
        form.message = m['auth.missing_fields']();
        return fail(400, { form });
      }

      try {
        locals.logger.debug('=== MFA Verification ===');
        locals.logger.withMetadata({ email, codeLength: code.length }).debug('Verifying OTP');

        const authData = await usersCollection.authWithOTP(otpId, code, { mfaId } as any);

        // Check if account is disabled
        if (authData.record.disabled) {
          locals.pb.authStore.clear();
          form.message = m['auth.login.account_disabled']();
          return fail(403, { form });
        }

        // Successful MFA verification
        locals.logger.debug('MFA verification successful');
        redirect(303, '/?login=success');
      } catch (err: any) {
        // Re-throw SvelteKit redirects
        if (err?.status && err?.location) {
          throw err;
        }

        locals.logger
          .withContext({ route: url.pathname, userId: locals.pb?.authStore?.record?.id, requestId: locals.requestId })
          .withMetadata(err)
          .error('MFA verification error');
        const errorMsg = err?.response?.message || err?.message;
        form.message = `${m['auth.mfa_invalid_code']()} - ${errorMsg || 'Unknown error'}`;
        // Keep all form data so user can retry
        form.data.email = email;
        form.data.password = password;
        form.data.mfaId = mfaId;
        form.data.otpId = otpId;
        return fail(400, { form });
      }
    }

    // No code provided, attempt password authentication
    if (!email || !password) {
      form.message = m['auth.missing_fields']();
      return fail(400, { form });
    }

    // Validate email format
    if (!z.string().email().safeParse(email).success) {
      form.message = m['validation.email_invalid']();
      return fail(400, { form });
    }

    // Validate password minimum length
    if (password.length < 8) {
      form.message = m['validation.password_min_length']();
      return fail(400, { form });
    }

    try {
      const authData = await usersCollection.authWithPassword(email, password);

      // Check if account is disabled
      if (authData.record.disabled) {
        locals.pb.authStore.clear();
        form.message = m['auth.login.account_disabled']();
        return fail(403, { form });
      }

      // Successful login without MFA
      redirect(303, '/?login=success');
    } catch (err: any) {
      // Re-throw SvelteKit redirects
      if (err?.status && err?.location) {
        throw err;
      }

      locals.logger
        .withContext({ route: url.pathname, userId: locals.pb?.authStore?.record?.id, requestId: locals.requestId })
        .withMetadata(err)
        .error('Login error');

      // Check if MFA is required
      const mfaIdFromError = err?.response?.mfaId;
      if (mfaIdFromError) {
        // MFA is required - request OTP
        try {
          locals.logger
            .withContext({
              route: url.pathname,
              userId: locals.pb?.authStore?.record?.id,
              requestId: locals.requestId,
              email,
            })
            .debug('MFA required, requesting OTP');

          const otpResponse = await usersCollection.requestOTP(email, { mfaId: mfaIdFromError } as any);

          locals.logger
            .withContext({ route: url.pathname, userId: locals.pb?.authStore?.record?.id, requestId: locals.requestId })
            .debug('OTP request successful');
          locals.logger
            .withContext({
              route: url.pathname,
              userId: locals.pb?.authStore?.record?.id,
              requestId: locals.requestId,
              otpId: otpResponse.otpId,
            })
            .debug('OTP sent');

          // Store MFA data and credentials in form for next submission
          form.data.email = email;
          form.data.password = password;
          form.data.mfaId = mfaIdFromError;
          form.data.otpId = otpResponse.otpId;
          form.message = m['auth.mfa_code_required']();
          return fail(400, { form });
        } catch (otpErr) {
          locals.logger
            .withContext({ route: url.pathname, userId: locals.pb?.authStore?.record?.id, requestId: locals.requestId })
            .withMetadata({ error: otpErr })
            .error('OTP request error');
          form.message = m['auth.mfa_send_failed']();
          return fail(400, { form });
        }
      }

      // Regular login error
      form.message = m['auth.login.invalid_credentials']();
      return fail(400, { form });
    }
  },
};
