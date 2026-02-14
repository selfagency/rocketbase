import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authenticateWithPassword, verifyMfaCode } from '../../../lib/auth/mfa-helpers';
import type { SuperValidated } from 'sveltekit-superforms';

// Mock the paraglide messages module
vi.mock('$lib/paraglide/messages.js', () => ({
  default: {},
  'auth.login.invalid_credentials': vi.fn(() => 'Invalid email or password'),
  'auth.login.account_disabled': vi.fn(() => 'Account has been disabled'),
  'auth.mfa_invalid_code': vi.fn(() => 'Invalid MFA code'),
  'auth.mfa_code_required': vi.fn(() => 'MFA code required'),
  'auth.mfa_send_failed': vi.fn(() => 'Failed to send MFA code'),
}));

describe('MFA Helpers', () => {
  let mockPb: any;
  let mockLogger: any;
  let mockForm: SuperValidated<any>;

  beforeEach(() => {
    const mockUsersCollection = {
      authWithOTP: vi.fn(),
      authWithPassword: vi.fn(),
      requestOTP: vi.fn(),
    };

    mockPb = {
      collection: vi.fn(() => mockUsersCollection),
      authStore: {
        isValid: true,
        clear: vi.fn(),
        record: { id: 'test-user-id' },
      },
    };

    mockLogger = {
      withContext: vi.fn().mockReturnThis(),
      withMetadata: vi.fn().mockReturnThis(),
      debug: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
    };

    mockForm = {
      valid: true,
      data: {},
      message: undefined,
    } as any;

    vi.clearAllMocks();
  });

  describe('verifyMfaCode', () => {
    it('successfully verifies MFA code and returns success', async () => {
      const mockAuthData = {
        token: 'test-token',
        record: { id: 'user-123', disabled: false },
      };
      mockPb.collection().authWithOTP.mockResolvedValue(mockAuthData);

      const result = await verifyMfaCode(
        {
          email: 'test@example.com',
          password: 'password123',
          code: '123456',
          mfaId: 'mfa-123',
          otpId: 'otp-123',
          pb: mockPb,
          logger: mockLogger,
          requestId: 'req-123',
          route: '/login',
        },
        mockForm
      );

      expect(result.success).toBe(true);
      expect(result.redirect).toBe('/?login=success');
      expect(mockPb.collection().authWithOTP).toHaveBeenCalledWith('otp-123', '123456', { mfaId: 'mfa-123' });
    });

    it('returns error when auth returns invalid token', async () => {
      const mockAuthData = {
        token: null, // Invalid token
        record: { id: 'user-123', disabled: false },
      };
      mockPb.collection().authWithOTP.mockResolvedValue(mockAuthData);

      const result = await verifyMfaCode(
        {
          email: 'test@example.com',
          password: 'password123',
          code: '123456',
          mfaId: 'mfa-123',
          otpId: 'otp-123',
          pb: mockPb,
          logger: mockLogger,
          route: '/login',
        },
        mockForm
      );

      expect(result).toHaveProperty('status', 400);
      expect(mockPb.authStore.clear).toHaveBeenCalled();
      expect(mockForm.message).toBe('Invalid email or password');
    });

    it('returns error when authStore is invalid', async () => {
      const mockAuthData = {
        token: 'test-token',
        record: { id: 'user-123', disabled: false },
      };
      mockPb.collection().authWithOTP.mockResolvedValue(mockAuthData);
      mockPb.authStore.isValid = false; // Auth store invalid

      const result = await verifyMfaCode(
        {
          email: 'test@example.com',
          password: 'password123',
          code: '123456',
          mfaId: 'mfa-123',
          otpId: 'otp-123',
          pb: mockPb,
          logger: mockLogger,
          route: '/login',
        },
        mockForm
      );

      expect(result).toHaveProperty('status', 400);
      expect(mockPb.authStore.clear).toHaveBeenCalled();
      expect(mockForm.message).toBe('Invalid email or password');
    });

    it('returns error when account is disabled', async () => {
      const mockAuthData = {
        token: 'test-token',
        record: { id: 'user-123', disabled: true }, // Account disabled
      };
      mockPb.collection().authWithOTP.mockResolvedValue(mockAuthData);

      const result = await verifyMfaCode(
        {
          email: 'test@example.com',
          password: 'password123',
          code: '123456',
          mfaId: 'mfa-123',
          otpId: 'otp-123',
          pb: mockPb,
          logger: mockLogger,
          route: '/login',
        },
        mockForm
      );

      expect(result).toHaveProperty('status', 403);
      expect(mockPb.authStore.clear).toHaveBeenCalled();
      expect(mockForm.message).toBe('Account has been disabled');
    });

    it('handles OTP verification errors', async () => {
      const error = new Error('Invalid OTP code');
      (error as any).response = { message: 'Code expired' };
      mockPb.collection().authWithOTP.mockRejectedValue(error);

      const result = await verifyMfaCode(
        {
          email: 'test@example.com',
          password: 'password123',
          code: '123456',
          mfaId: 'mfa-123',
          otpId: 'otp-123',
          pb: mockPb,
          logger: mockLogger,
          route: '/login',
        },
        mockForm
      );

      expect(result).toHaveProperty('status', 400);
      expect(mockForm.message).toContain('Invalid MFA code');
      expect(mockForm.message).toContain('Code expired');
      // Form data should be preserved for retry
      expect((mockForm.data as any).email).toBe('test@example.com');
      expect((mockForm.data as any).password).toBe('password123');
      expect((mockForm.data as any).mfaId).toBe('mfa-123');
      expect((mockForm.data as any).otpId).toBe('otp-123');
    });
  });

  describe('authenticateWithPassword', () => {
    it('successfully authenticates and returns success', async () => {
      const mockAuthData = {
        token: 'test-token',
        record: { id: 'user-123', disabled: false },
      };
      mockPb.collection().authWithPassword.mockResolvedValue(mockAuthData);

      const result = await authenticateWithPassword(
        {
          email: 'test@example.com',
          password: 'password123',
          pb: mockPb,
          logger: mockLogger,
          requestId: 'req-123',
          route: '/login',
        },
        mockForm
      );

      expect(result.success).toBe(true);
      expect(result.redirect).toBe('/?login=success');
      expect(mockPb.collection().authWithPassword).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('returns error when auth returns invalid token', async () => {
      const mockAuthData = {
        token: null, // Invalid token
        record: { id: 'user-123', disabled: false },
      };
      mockPb.collection().authWithPassword.mockResolvedValue(mockAuthData);

      const result = await authenticateWithPassword(
        {
          email: 'test@example.com',
          password: 'password123',
          pb: mockPb,
          logger: mockLogger,
          route: '/login',
        },
        mockForm
      );

      expect(result).toHaveProperty('status', 400);
      expect(mockPb.authStore.clear).toHaveBeenCalled();
      expect(mockForm.message).toBe('Invalid email or password');
    });

    it('returns error when authStore is invalid', async () => {
      const mockAuthData = {
        token: 'test-token',
        record: { id: 'user-123', disabled: false },
      };
      mockPb.collection().authWithPassword.mockResolvedValue(mockAuthData);
      mockPb.authStore.isValid = false; // Auth store invalid

      const result = await authenticateWithPassword(
        {
          email: 'test@example.com',
          password: 'password123',
          pb: mockPb,
          logger: mockLogger,
          route: '/login',
        },
        mockForm
      );

      expect(result).toHaveProperty('status', 400);
      expect(mockPb.authStore.clear).toHaveBeenCalled();
      expect(mockForm.message).toBe('Invalid email or password');
    });

    it('returns error when account is disabled', async () => {
      const mockAuthData = {
        token: 'test-token',
        record: { id: 'user-123', disabled: true }, // Account disabled
      };
      mockPb.collection().authWithPassword.mockResolvedValue(mockAuthData);

      const result = await authenticateWithPassword(
        {
          email: 'test@example.com',
          password: 'password123',
          pb: mockPb,
          logger: mockLogger,
          route: '/login',
        },
        mockForm
      );

      expect(result).toHaveProperty('status', 403);
      expect(mockPb.authStore.clear).toHaveBeenCalled();
      expect(mockForm.message).toBe('Account has been disabled');
    });

    it('handles MFA required scenario', async () => {
      const error: any = new Error('MFA required');
      error.response = { mfaId: 'mfa-123' };
      mockPb.collection().authWithPassword.mockRejectedValue(error);

      // Mock requestOTP for MFA flow
      const mockOtpResponse = { otpId: 'otp-456' };
      mockPb.collection().requestOTP.mockResolvedValue(mockOtpResponse);

      const result = await authenticateWithPassword(
        {
          email: 'test@example.com',
          password: 'password123',
          pb: mockPb,
          logger: mockLogger,
          route: '/login',
        },
        mockForm
      );

      expect(result).toHaveProperty('status', 400);
      expect(mockPb.collection().requestOTP).toHaveBeenCalledWith('test@example.com', { mfaId: 'mfa-123' });
      expect(mockForm.message).toBe('MFA code required');
      // Form should have MFA data
      expect((mockForm.data as any).email).toBe('test@example.com');
      expect((mockForm.data as any).password).toBe('password123');
      expect((mockForm.data as any).mfaId).toBe('mfa-123');
      expect((mockForm.data as any).otpId).toBe('otp-456');
    });

    it('handles MFA OTP request failure', async () => {
      const authError: any = new Error('MFA required');
      authError.response = { mfaId: 'mfa-123' };
      mockPb.collection().authWithPassword.mockRejectedValue(authError);

      // Mock OTP request failure
      const otpError = new Error('Failed to send OTP');
      mockPb.collection().requestOTP.mockRejectedValue(otpError);

      const result = await authenticateWithPassword(
        {
          email: 'test@example.com',
          password: 'password123',
          pb: mockPb,
          logger: mockLogger,
          route: '/login',
        },
        mockForm
      );

      expect(result).toHaveProperty('status', 400);
      expect(mockForm.message).toBe('Failed to send MFA code');
      expect(mockLogger.error).toHaveBeenCalledWith('OTP request error');
    });

    it('handles regular login errors', async () => {
      const error = new Error('Invalid credentials');
      mockPb.collection().authWithPassword.mockRejectedValue(error);

      const result = await authenticateWithPassword(
        {
          email: 'test@example.com',
          password: 'wrong-password',
          pb: mockPb,
          logger: mockLogger,
          route: '/login',
        },
        mockForm
      );

      expect(result).toHaveProperty('status', 400);
      expect(mockForm.message).toBe('Invalid email or password');
    });
  });
});
