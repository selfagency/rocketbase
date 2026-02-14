import { authenticateWithPassword, verifyMfaCode } from '$lib/auth/mfa-helpers';
import { loginSchema, type LoginSchema } from '$lib/auth/schemas';
import * as m from '$lib/paraglide/messages';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // Redirect if already logged in
  if (locals.user) {
    return redirect(303, '/');
  }

  const form = await superValidate<LoginSchema>(zod4(loginSchema));
  return { form };
};

export const actions: Actions = {
  login: async ({ request, locals, url }) => {
    // Emit simple console logs so container logs capture test-relevant events
    try {
      console.log('[login] action invoked', { route: url.pathname, requestId: locals.requestId });
    } catch {
      // Ignore console errors
    }

    const form = await superValidate(request, zod4(loginSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const { email, password, code, mfaId, otpId } = form.data;

    // If code is provided, user is completing MFA
    if (code) {
      if (!email || !password || !otpId || !mfaId) {
        form.message = m['auth.missing_fields']();
        return fail(400, { form });
      }

      const result = await verifyMfaCode(
        {
          email,
          password,
          code,
          mfaId,
          otpId,
          pb: locals.pb,
          logger: locals.logger,
          requestId: locals.requestId,
          route: url.pathname,
        },
        form
      );

      // Handle redirect or error
      if (result.success && result.redirect) {
        return redirect(303, result.redirect);
      }
      return result;
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

    const result = await authenticateWithPassword(
      {
        email,
        password,
        pb: locals.pb,
        logger: locals.logger,
        requestId: locals.requestId,
        route: url.pathname,
      },
      form
    );

    // Handle redirect or error
    if (result.success && result.redirect) {
      return redirect(303, result.redirect);
    }
    return result;
  },
};
