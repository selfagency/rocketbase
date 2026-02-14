import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from '../../../lib/auth/schemas';

describe('auth schemas', () => {
  describe('loginSchema', () => {
    it('allows empty object (all fields optional)', () => {
      const result = loginSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('allows email and password', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('allows MFA fields', () => {
      const result = loginSchema.safeParse({
        code: '123456',
        mfaId: 'mfa-id-123',
        otpId: 'otp-id-456',
      });
      expect(result.success).toBe(true);
    });

    it('accepts mixed fields', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        code: '123456',
        mfaId: 'mfa-id-123',
      });
      expect(result.success).toBe(true);
    });

    it('allows extra fields and strips them', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
        extraField: 'extra',
      });
      expect(result.success).toBe(true);
      expect('extraField' in result.data!).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('validates valid registration input', () => {
      const input = {
        email: 'user@example.com',
        password: 'securepass123',
        passwordConfirm: 'securepass123',
        name: 'John Doe',
      };
      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
        expect(result.data.name).toBe('John Doe');
      }
    });

    it('rejects invalid email format', () => {
      const input = {
        email: 'not-an-email',
        password: 'securepass123',
        passwordConfirm: 'securepass123',
        name: 'John Doe',
      };
      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects password shorter than 8 characters', () => {
      const input = {
        email: 'user@example.com',
        password: 'short',
        passwordConfirm: 'short',
        name: 'John Doe',
      };
      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects name shorter than 2 characters', () => {
      const input = {
        email: 'user@example.com',
        password: 'securepass123',
        passwordConfirm: 'securepass123',
        name: 'J',
      };
      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects mismatched password confirmation', () => {
      const input = {
        email: 'user@example.com',
        password: 'securepass123',
        passwordConfirm: 'differentpass123',
        name: 'John Doe',
      };
      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('validates minimum field lengths correctly', () => {
      const input = {
        email: 'a@b.co',
        password: 'password1',
        passwordConfirm: 'password1',
        name: 'AB',
      };
      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('handles edge case of exactly 8 character password', () => {
      const input = {
        email: 'user@example.com',
        password: 'password',
        passwordConfirm: 'password',
        name: 'John Doe',
      };
      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });
});
