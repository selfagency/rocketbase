import type { RequestEvent } from '@sveltejs/kit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { actions } from '../../../routes/login/+page.server';

describe('Login Server Actions', () => {
  let mockLocals: any;
  let mockEvent: Partial<RequestEvent>;
  let mockCollection: any;

  beforeEach(() => {
    mockCollection = {
      authWithPassword: vi.fn(),
      requestOTP: vi.fn(),
      authWithOTP: vi.fn(),
    };

    mockLocals = {
      pb: {
        collection: vi.fn(() => mockCollection),
      },
      logger: {
        withContext: vi.fn().mockReturnThis(),
        withMetadata: vi.fn().mockReturnThis(),
        error: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
      },
      user: null,
    };

    // Reset mocks
    vi.clearAllMocks();

    mockEvent = {
      locals: mockLocals,
      request: new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }),
      url: new URL('http://localhost/login'),
    };
  });

  describe('default action (login)', () => {
    it('successfully authenticates user with valid credentials', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      mockCollection.authWithPassword.mockResolvedValue({
        token: 'test-token',
        record: { id: '123', email: 'test@example.com' },
      });

      try {
        await actions.login(mockEvent as any);
      } catch (error: any) {
        // Expecting a redirect
        expect(error.status).toBe(303);
        expect(error.location).toBe('/?login=success');
      }
    });

    it('returns error for invalid credentials', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'wrongpassword');

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      mockLocals.pb.collection().authWithPassword.mockRejectedValue(new Error('Invalid credentials'));

      const result = await actions.login(mockEvent as any);

      expect(result).toHaveProperty('status', 400);
      expect((result as any).data.form.message).toBe('Invalid email or password');
    });

    it('handles MFA requirement and requests OTP', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      const mfaError: any = new Error('MFA required');
      mfaError.response = { mfaId: 'mfa-123' };

      mockCollection.authWithPassword.mockRejectedValue(mfaError);
      mockCollection.requestOTP.mockResolvedValue({ otpId: 'otp-456' });

      const result: any = await actions.login(mockEvent as any);

      expect(result).toHaveProperty('status', 400);
      expect(result.data.form.data.mfaId).toBe('mfa-123');
      expect(result.data.form.data.otpId).toBe('otp-456');
      expect(result.data.form.data.email).toBe('test@example.com');
      expect(result.data.form.data.password).toBe('password123');
      expect(result.data.form.message.toLowerCase()).toContain('verification code');
      expect(mockCollection.requestOTP).toHaveBeenCalledWith('test@example.com', {
        mfaId: 'mfa-123',
      });
    });

    it('validates email format', async () => {
      const formData = new FormData();
      formData.append('email', 'invalid-email');
      formData.append('password', 'password123');

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      const result = await actions.login(mockEvent as any);

      expect(result).toHaveProperty('status', 400);
    });

    it('validates password length', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'short');

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      const result = await actions.login(mockEvent as any);

      expect(result).toHaveProperty('status', 400);
    });
  });

  describe('MFA verification (login with code)', () => {
    it('successfully verifies MFA with valid OTP code', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');
      formData.append('code', '123456');
      formData.append('otpId', 'otp-123');
      formData.append('mfaId', 'mfa-456');

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      mockCollection.authWithOTP.mockResolvedValue({
        token: 'test-token',
        record: { id: '123', email: 'test@example.com', disabled: false },
      });

      try {
        await actions.login(mockEvent as any);
      } catch (error: any) {
        // Expecting a redirect
        expect(error.status).toBe(303);
        expect(error.location).toBe('/?login=success');
      }
    });

    it('returns error for invalid OTP code', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');
      formData.append('code', '000000');
      formData.append('otpId', 'otp-123');
      formData.append('mfaId', 'mfa-456');

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      mockCollection.authWithOTP.mockRejectedValue(new Error('Invalid code'));

      const result: any = await actions.login(mockEvent as any);

      expect(result).toHaveProperty('status', 400);
      expect(result.data.form.message).toContain('Invalid verification code');
    });

    it('returns error when required fields are missing', async () => {
      const formData = new FormData();
      formData.append('code', '123456');
      // Missing email, password, otpId and mfaId

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      const result = await actions.login(mockEvent as any);

      expect(result).toHaveProperty('status', 400);
      expect((result as any).data.form.message).toContain('required');
    });
  });
});
