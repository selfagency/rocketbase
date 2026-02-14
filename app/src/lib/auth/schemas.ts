/**
 * Shared authentication form schemas for login and registration
 */

import * as m from '$lib/paraglide/messages.js';
import { z } from 'zod';

/**
 * Login form schema
 * Supports both password authentication and MFA verification
 */
export const loginSchema = z.object({
  email: z.string().optional(),
  password: z.string().optional(),
  code: z.string().optional(),
  mfaId: z.string().optional(),
  otpId: z.string().optional(),
});

export type LoginSchema = z.infer<typeof loginSchema>;

/**
 * Registration form schema with password confirmation
 */
export const registerSchema = z
  .object({
    email: z.string().email(m['validation.email_invalid']()),
    password: z.string().min(8, m['validation.password_min_length']()),
    passwordConfirm: z.string(),
    name: z.string().min(2, m['validation.name_min_length']()),
  })
  .refine(data => data.password === data.passwordConfirm, {
    message: m['validation.passwords_no_match'](),
    path: ['passwordConfirm'],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;
