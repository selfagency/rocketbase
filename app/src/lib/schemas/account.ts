import * as m from '$lib/paraglide/messages.js';
import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(2, m['validation.name_min_length']()),
  email: z.email(m['validation.email_invalid']()),
  title: z.string().optional(),
  bio: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  avatar: z.instanceof(File).optional(),
});

export const passwordSchema = z
  .object({
    oldPassword: z.string().min(8, m['validation.password_min_length']()),
    password: z.string().min(8, m['validation.password_min_length']()),
    passwordConfirm: z.string().min(8, m['validation.password_min_length']()),
  })
  .refine(data => data.password === data.passwordConfirm, {
    message: m['validation.password_mismatch'](),
    path: ['passwordConfirm'],
  });

export const mfaSchema = z.object({
  mfaOptIn: z.boolean(),
});

export type ProfileSchema = z.infer<typeof profileSchema>;
export type PasswordSchema = z.infer<typeof passwordSchema>;
export type MfaSchema = z.infer<typeof mfaSchema>;
