import type { RequestEvent } from '@sveltejs/kit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { actions, load } from '../../../routes/account/+page.server';

describe('Account Server Actions', () => {
  let mockLocals: any;
  let mockEvent: Partial<RequestEvent>;
  let mockCollection: any;
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    title: 'Developer',
    bio: 'Test bio',
    website: 'https://example.com',
    avatar: '',
  };

  beforeEach(() => {
    mockCollection = {
      update: vi.fn(),
      authRefresh: vi.fn(),
      authWithPassword: vi.fn(),
      requestVerification: vi.fn(),
      requestOTP: vi.fn(),
      getFullList: vi.fn(),
      authWithOTP: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    };

    mockLocals = {
      pb: {
        collection: vi.fn(() => mockCollection),
        authStore: {
          record: mockUser,
        },
      },
      logger: {
        withMetadata: vi.fn().mockReturnThis(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
      },
      user: mockUser,
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

  describe('load function', () => {
    it('redirects to login when user is not authenticated', async () => {
      mockLocals.user = null;

      try {
        await load(mockEvent as any);
      } catch (error: any) {
        expect(error.status).toBe(303);
        expect(error.location).toBe('/login');
      }
    });

    it('loads user data successfully', async () => {
      const result: any = await load(mockEvent as any);

      expect(result.user).toEqual(mockUser);
    });
  });

  describe('updateProfile action', () => {
    it('successfully updates user profile', async () => {
      const formData = new FormData();
      formData.append('name', 'Updated Name');
      formData.append('email', 'updated@example.com');
      formData.append('title', 'Senior Developer');
      formData.append('bio', 'Updated bio');
      formData.append('website', 'https://updated.com');

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      mockCollection.update.mockResolvedValue({ ...mockUser, name: 'Updated Name' });
      mockCollection.authRefresh.mockResolvedValue({});

      const result: any = await actions.updateProfile(mockEvent as any);

      expect(result.success).toBe(true);
      expect(mockCollection.update).toHaveBeenCalledWith('user-123', expect.any(Object));
      expect(mockCollection.authRefresh).toHaveBeenCalled();
    });

    it('validates name minimum length', async () => {
      const formData = new FormData();
      formData.append('name', 'A');
      formData.append('email', 'test@example.com');

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      const result = await actions.updateProfile(mockEvent as any);

      expect(result).toHaveProperty('status', 400);
    });

    it('validates email format', async () => {
      const formData = new FormData();
      formData.append('name', 'Test User');
      formData.append('email', 'invalid-email');

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      const result = await actions.updateProfile(mockEvent as any);

      expect(result).toHaveProperty('status', 400);
    });

    it('requires authentication', async () => {
      mockLocals.user = null;

      const formData = new FormData();
      formData.append('name', 'Test');
      formData.append('email', 'test@example.com');

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      const result = await actions.updateProfile(mockEvent as any);

      expect(result).toHaveProperty('status', 401);
    });
  });

  describe('sendVerificationEmail action', () => {
    it('successfully sends verification email', async () => {
      const formData = new FormData();

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      mockCollection.requestVerification.mockResolvedValue({});

      const result: any = await actions.sendVerificationEmail(mockEvent as any);

      expect(result.success).toBe(true);
      expect(mockCollection.requestVerification).toHaveBeenCalledWith(mockUser.email);
    });

    it('requires authentication', async () => {
      mockLocals.user = null;

      const formData = new FormData();

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      const result = await actions.sendVerificationEmail(mockEvent as any);

      expect(result).toHaveProperty('status', 401);
    });
  });

  describe('changePassword action', () => {
    it('successfully changes password', async () => {
      const formData = new FormData();
      formData.append('oldPassword', 'oldPassword123');
      formData.append('password', 'newPassword123');
      formData.append('passwordConfirm', 'newPassword123');

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      // Mock successful password update and re-authentication
      mockCollection.update.mockResolvedValue(mockUser);
      mockCollection.authWithPassword.mockResolvedValue({
        token: 'test-token',
        record: mockUser,
      });

      const result: any = await actions.changePassword(mockEvent as any);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Password changed successfully');
      expect(mockCollection.update).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          oldPassword: 'oldPassword123',
          password: 'newPassword123',
          passwordConfirm: 'newPassword123',
        })
      );
      // After password update, should re-authenticate with new password
      expect(mockCollection.authWithPassword).toHaveBeenCalledWith(
        'test@example.com',
        'newPassword123'
      );
    });

    it('validates password length', async () => {
      const formData = new FormData();
      formData.append('oldPassword', 'oldPassword123');
      formData.append('password', 'short');
      formData.append('passwordConfirm', 'short');

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      const result = await actions.changePassword(mockEvent as any);

      expect(result).toHaveProperty('status', 400);
    });

    it('validates password confirmation matches', async () => {
      const formData = new FormData();
      formData.append('oldPassword', 'oldPassword123');
      formData.append('password', 'newPassword123');
      formData.append('passwordConfirm', 'differentPassword123');

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      const result = await actions.changePassword(mockEvent as any);

      expect(result).toHaveProperty('status', 400);
    });

    it('requires authentication', async () => {
      mockLocals.user = null;

      const formData = new FormData();
      formData.append('oldPassword', 'oldPassword123');
      formData.append('password', 'newPassword123');
      formData.append('passwordConfirm', 'newPassword123');

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      const result = await actions.changePassword(mockEvent as any);

      expect(result).toHaveProperty('status', 401);
    });
  });

  describe('toggleMfaOptIn action', () => {
    it('successfully toggles MFA opt-in to true', async () => {
      const formData = new FormData();
      formData.append('mfaOptIn', 'true');

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      mockCollection.update.mockResolvedValue({
        ...mockUser,
        mfaOptIn: true,
      });
      mockCollection.authRefresh.mockResolvedValue({});

      const result: any = await actions.toggleMfaOptIn(mockEvent as any);

      expect(result.success).toBe(true);
      expect(mockCollection.update).toHaveBeenCalledWith('user-123', expect.objectContaining({ mfaOptIn: true }));
    });

    it('successfully toggles MFA opt-in to false', async () => {
      const formData = new FormData();
      formData.append('mfaOptIn', 'false');

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      mockCollection.update.mockResolvedValue({
        ...mockUser,
        mfaOptIn: false,
      });
      mockCollection.authRefresh.mockResolvedValue({});

      const result: any = await actions.toggleMfaOptIn(mockEvent as any);

      expect(result.success).toBe(true);
      expect(mockCollection.update).toHaveBeenCalledWith('user-123', expect.objectContaining({ mfaOptIn: false }));
    });

    it('requires authentication', async () => {
      mockLocals.user = null;

      const formData = new FormData();
      formData.append('mfaOptIn', 'true');

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      const result = await actions.toggleMfaOptIn(mockEvent as any);

      expect(result).toHaveProperty('status', 401);
    });
  });

  describe('requestTwoFactor action', () => {
    it('successfully requests OTP code', async () => {
      expect.assertions(3);

      const formData = new FormData();
      formData.append('email', 'test@example.com');

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      mockCollection.requestOTP.mockResolvedValue({ otpId: 'otp-123' });

      const result: any = await actions.requestTwoFactor(mockEvent as any);

      expect(result.otpId).toBe('otp-123');
      expect(result.otpRequested).toBe(true);
      expect(mockCollection.requestOTP).toHaveBeenCalledWith('test@example.com');
    });

    it('requires authentication', async () => {
      expect.assertions(1);

      mockLocals.user = null;

      const formData = new FormData();
      formData.append('email', 'test@example.com');

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      const result = await actions.requestTwoFactor(mockEvent as any);

      expect(result).toHaveProperty('status', 401);
    });
  });

  describe('verifyTwoFactor action', () => {
    it('successfully enables 2FA with valid code', async () => {
      expect.assertions(3);

      const formData = new FormData();
      formData.append('otpId', 'otp-123');
      formData.append('code', '123456');

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      mockCollection.getFullList.mockResolvedValue([{ id: 'otp-123', recordRef: 'user-123' }]);
      mockCollection.authWithOTP.mockResolvedValue({});
      mockCollection.create.mockResolvedValue({ id: 'mfa-1' });

      const result: any = await actions.verifyTwoFactor(mockEvent as any);

      expect(result.twoFactorEnabled).toBe(true);
      expect(result.success).toBe(true);
      expect(mockCollection.create).toHaveBeenCalledWith({
        collectionRef: 'users',
        recordRef: 'user-123',
        method: 'otp',
      });
    });

    it('returns error for invalid OTP code', async () => {
      expect.assertions(1);

      const formData = new FormData();
      formData.append('otpId', 'otp-123');
      formData.append('code', '000000');

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      mockCollection.getFullList.mockResolvedValue([{ id: 'otp-123', recordRef: 'user-123' }]);
      mockCollection.authWithOTP.mockRejectedValue(new Error('Invalid code'));

      const result = await actions.verifyTwoFactor(mockEvent as any);

      expect(result).toHaveProperty('status', 400);
    });

    it('requires authentication', async () => {
      expect.assertions(1);

      mockLocals.user = null;

      const formData = new FormData();
      formData.append('otpId', 'otp-123');
      formData.append('code', '123456');

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      const result = await actions.verifyTwoFactor(mockEvent as any);

      expect(result).toHaveProperty('status', 401);
    });
  });

  describe('disableTwoFactor action', () => {
    it('successfully disables 2FA', async () => {
      expect.assertions(3);

      mockCollection.getFullList.mockResolvedValue([{ id: 'mfa-1', recordRef: 'user-123', method: 'otp' }]);
      mockCollection.delete.mockResolvedValue({});

      const result: any = await actions.disableTwoFactor(mockEvent as any);

      expect(result.twoFactorEnabled).toBe(false);
      expect(result.success).toBe(true);
      expect(mockCollection.delete).toHaveBeenCalledWith('mfa-1');
    });

    it('requires authentication', async () => {
      expect.assertions(1);

      mockLocals.user = null;

      const result = await actions.disableTwoFactor(mockEvent as any);

      expect(result).toHaveProperty('status', 401);
    });
  });
});
