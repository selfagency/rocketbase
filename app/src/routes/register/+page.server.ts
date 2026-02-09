import * as m from '$lib/paraglide/messages';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';

const registerSchema = z
  .object({
    email: z.email(m['validation.email_invalid']()),
    password: z.string().min(8, m['validation.password_min_length']()),
    passwordConfirm: z.string(),
    name: z.string().min(2, m['validation.name_min_length']()),
  })
  .refine(data => data.password === data.passwordConfirm, {
    message: m['validation.passwords_no_match'](),
    path: ['passwordConfirm'],
  });

type RegisterSchema = z.infer<typeof registerSchema>;

export const load: PageServerLoad = async ({ locals }) => {
  // Redirect if already logged in
  if (locals.user) {
    redirect(303, '/');
  }

  const form = await superValidate<RegisterSchema>(zod4(registerSchema));
  return { form };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
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
      console.error('Registration error:', err);
      return fail(400, {
        form,
        message: err?.message || 'Registration failed. Please try again.',
      });
    }

    // Redirect to login after successful registration
    redirect(303, '/login');
  },
};
