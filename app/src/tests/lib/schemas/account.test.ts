import { describe, it, expect } from 'vitest';
import { profileSchema, passwordSchema, mfaSchema } from '../../../lib/schemas/account';

describe('account schemas', () => {
  describe('profileSchema', () => {
    it('validates correct profile data', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        title: 'Developer',
        bio: 'Software engineer',
        website: 'https://example.com',
      };

      const result = profileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects name that is too short', () => {
      const data = {
        name: 'J',
        email: 'john@example.com',
      };

      const result = profileSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects invalid email', () => {
      const data = {
        name: 'John Doe',
        email: 'invalid-email',
      };

      const result = profileSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('allows optional fields to be omitted', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const result = profileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('allows empty string for website', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        website: '',
      };

      const result = profileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects invalid website URL', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        website: 'not-a-url',
      };

      const result = profileSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('passwordSchema', () => {
    it('validates matching passwords', () => {
      const data = {
        oldPassword: 'oldpass123',
        password: 'newpass456',
        passwordConfirm: 'newpass456',
      };

      const result = passwordSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects password mismatch', () => {
      const data = {
        oldPassword: 'oldpass123',
        password: 'newpass456',
        passwordConfirm: 'different789',
      };

      const result = passwordSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects password that is too short', () => {
      const data = {
        oldPassword: 'old123',
        password: 'new456',
        passwordConfirm: 'new456',
      };

      const result = passwordSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('requires minimum 8 characters for all password fields', () => {
      const shortData = {
        oldPassword: 'short',
        password: 'newpass456',
        passwordConfirm: 'newpass456',
      };

      const result = passwordSchema.safeParse(shortData);
      expect(result.success).toBe(false);
    });
  });

  describe('mfaSchema', () => {
    it('validates MFA opt-in as true', () => {
      const data = { mfaOptIn: true };
      const result = mfaSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates MFA opt-in as false', () => {
      const data = { mfaOptIn: false };
      const result = mfaSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects non-boolean values', () => {
      const data = { mfaOptIn: 'true' };
      const result = mfaSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
