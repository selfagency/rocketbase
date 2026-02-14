import { registerSchema, type RegisterSchema } from '$lib/auth/schemas';
import * as m from '$lib/paraglide/messages';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // Redirect if already logged in
  if (locals.user) {
    redirect(303, '/');
  }

  const form = await superValidate<RegisterSchema>(zod4(registerSchema));
  return { form };
};

export const actions: Actions = {
  register: async ({ request, locals, url }) => {
    const form = await superValidate<RegisterSchema>(request, zod4(registerSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      // Create user with default 'user' role
      await locals.pb.collection('users').create({
        email: form.data.email,
        password: form.data.password,
        passwordConfirm: form.data.passwordConfirm,
        name: form.data.name,
        role: 'user',
      });
    } catch (err: any) {
      locals.logger
        .withContext({
          route: url.pathname,
          userId: locals.pb?.authStore?.record?.id,
          requestId: locals.requestId,
        })
        .withMetadata(err)
        .error('Registration error');
      return fail(400, {
        form,
        message: err?.message || m['auth.register_failed'](),
      });
    }

    // Redirect to login after successful registration with success flag
    redirect(303, '/login?registered=true');
  },
};
