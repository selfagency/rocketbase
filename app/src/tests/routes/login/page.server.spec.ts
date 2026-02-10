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

      console.log('mfaError:', mfaError);
      console.log('mfaError.response:', mfaError.response);
      console.log('mfaError.response.mfaId:', mfaError.response?.mfaId);

      mockCollection.authWithPassword.mockRejectedValue(mfaError);

      const requestOTPSpy = vi.fn(() => Promise.resolve({ otpId: 'otp-456' }));
      mockCollection.requestOTP = requestOTPSpy;

      let result: any;
      let threw = false;
      try {
        result = await actions.login(mockEvent as any);
      } catch (error) {
        threw = true;
        result = error;
      }

      console.log('Result:', result);
      console.log('Threw:', threw);
      console.log('authWithPassword called:', mockCollection.authWithPassword.mock.calls);
      console.log('requestOTP called:', requestOTPSpy.mock.calls);

      expect(threw).toBe(false);
      expect(result.mfaRequired).toBe(true);
      expect(result.mfaId).toBe('mfa-123');
      expect(result.otpId).toBe('otp-456');
      expect(result.email).toBe('test@example.com');
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

  describe('verifyMfa action', () => {
    it('successfully verifies MFA with valid OTP code', async () => {
      const formData = new FormData();
      formData.append('otpId', 'otp-123');
      formData.append('code', '123456');
      formData.append('mfaId', 'mfa-456');
      formData.append('email', 'test@example.com');

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      mockCollection.authWithOTP.mockResolvedValue({
        token: 'test-token',
        record: { id: '123', email: 'test@example.com', disabled: false },
      });

      try {
        await actions.verifyMfa(mockEvent as any);
      } catch (error: any) {
        // Expecting a redirect
        expect(error.status).toBe(303);
        expect(error.location).toBe('/?login=success');
      }
    });

    it('returns error for invalid OTP code', async () => {
      const formData = new FormData();
      formData.append('otpId', 'otp-123');
      formData.append('code', '000000');
      formData.append('mfaId', 'mfa-456');
      formData.append('email', 'test@example.com');

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      mockCollection.authWithOTP.mockRejectedValue(new Error('Invalid code'));

      const result: any = await actions.verifyMfa(mockEvent as any);

      expect(result).toHaveProperty('status', 400);
      expect(result.data.message).toContain('Invalid verification code');
    });

    it('returns error when required fields are missing', async () => {
      const formData = new FormData();
      formData.append('code', '123456');
      // Missing otpId and mfaId

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      const result = await actions.verifyMfa(mockEvent as any);

      expect(result).toHaveProperty('status', 400);
    });
  });
});
