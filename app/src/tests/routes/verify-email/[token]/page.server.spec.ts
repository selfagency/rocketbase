import { beforeEach, describe, expect, it, vi } from 'vitest';
import { load } from '../../../../routes/verify-email/[token]/+page.server';

// Mock paraglide messages
vi.mock('$lib/paraglide/messages', () => ({
  'verify.invalid_verification_link': () => 'Invalid verification link',
  'verify.email_verification_failed': () => 'Email verification failed',
}));

describe('Verify Email Page Server', () => {
  let mockLocals: any;
  let mockParams: any;
  let mockUrl: any;

  beforeEach(() => {
    const mockCollection = {
      confirmVerification: vi.fn(),
    };

    mockLocals = {
      pb: {
        collection: vi.fn(() => mockCollection),
        authStore: {
          record: {
            id: 'user123',
          },
        },
      },
      logger: {
        withContext: vi.fn().mockReturnThis(),
        withMetadata: vi.fn().mockReturnThis(),
        error: vi.fn(),
      },
      requestId: 'req-123',
    };

    mockUrl = {
      pathname: '/verify-email/test-token',
    };

    vi.clearAllMocks();
  });

  describe('load function', () => {
    it('redirects to account page with verified param on success', async () => {
      mockParams = { token: 'valid-token' };
      mockLocals.pb.collection().confirmVerification.mockResolvedValue(undefined);

      try {
        await load({ params: mockParams, locals: mockLocals, url: mockUrl } as any);
      } catch (error: any) {
        expect(error.status).toBe(303);
        expect(error.location).toBe('/account?verified=true');
      }
    });

    it('returns error when token is missing', async () => {
      mockParams = { token: '' };

      const result: any = await load({ params: mockParams, locals: mockLocals, url: mockUrl } as any);

      expect(result).toEqual({
        error: 'Invalid verification link',
      });
      expect(mockLocals.pb.collection().confirmVerification).not.toHaveBeenCalled();
    });

    it('returns error when token is undefined', async () => {
      mockParams = { token: undefined };

      const result: any = await load({ params: mockParams, locals: mockLocals, url: mockUrl } as any);

      expect(result).toEqual({
        error: 'Invalid verification link',
      });
    });

    it('returns error when token is null', async () => {
      mockParams = { token: null };

      const result: any = await load({ params: mockParams, locals: mockLocals, url: mockUrl } as any);

      expect(result).toEqual({
        error: 'Invalid verification link',
      });
    });

    it('handles PocketBase verification error', async () => {
      mockParams = { token: 'invalid-token' };

      const pbError = new Error('Token expired');
      mockLocals.pb.collection().confirmVerification.mockRejectedValue(pbError);

      const result: any = await load({ params: mockParams, locals: mockLocals, url: mockUrl } as any);

      expect(result).toEqual({
        error: 'Token expired',
      });
    });

    it('logs error context when verification fails', async () => {
      mockParams = { token: 'bad-token' };

      const pbError = new Error('Invalid token');
      mockLocals.pb.collection().confirmVerification.mockRejectedValue(pbError);

      await load({ params: mockParams, locals: mockLocals, url: mockUrl } as any);

      expect(mockLocals.logger.withContext).toHaveBeenCalledWith({
        route: '/verify-email/test-token',
        userId: 'user123',
        requestId: 'req-123',
      });
      expect(mockLocals.logger.withMetadata).toHaveBeenCalledWith(pbError);
      expect(mockLocals.logger.error).toHaveBeenCalledWith('Email verification error');
    });

    it('uses default error message when PocketBase error has no message', async () => {
      mockParams = { token: 'token' };
      mockLocals.pb.collection().confirmVerification.mockRejectedValue({});

      const result: any = await load({ params: mockParams, locals: mockLocals, url: mockUrl } as any);

      expect(result).toEqual({
        error: 'Email verification failed',
      });
    });

    it('handles error object without message property', async () => {
      mockParams = { token: 'token' };
      mockLocals.pb.collection().confirmVerification.mockRejectedValue({ status: 400 });

      const result: any = await load({ params: mockParams, locals: mockLocals, url: mockUrl } as any);

      expect(result.error).toBe('Email verification failed');
    });

    it('handles different token formats', async () => {
      mockParams = { token: 'abc-123-xyz-789' };
      mockLocals.pb.collection().confirmVerification.mockResolvedValue(undefined);

      try {
        await load({ params: mockParams, locals: mockLocals, url: mockUrl } as any);
      } catch (error: any) {
        expect(error.location).toBe('/account?verified=true');
      }

      expect(mockLocals.pb.collection().confirmVerification).toHaveBeenCalledWith('abc-123-xyz-789');
    });

    it('calls confirmVerification on users collection', async () => {
      mockParams = { token: 'test-token' };
      mockLocals.pb.collection().confirmVerification.mockResolvedValue(undefined);

      try {
        await load({ params: mockParams, locals: mockLocals, url: mockUrl } as any);
      } catch {
        // Expected redirect
      }

      expect(mockLocals.pb.collection).toHaveBeenCalledWith('users');
    });

    it('does not redirect when token is missing', async () => {
      mockParams = { token: '' };

      const result: any = await load({ params: mockParams, locals: mockLocals, url: mockUrl } as any);

      expect(result).toHaveProperty('error');
      expect(mockLocals.pb.collection().confirmVerification).not.toHaveBeenCalled();
    });

    it('does not redirect when verification fails', async () => {
      mockParams = { token: 'bad-token' };
      mockLocals.pb.collection().confirmVerification.mockRejectedValue(new Error('Failed'));

      const result: any = await load({ params: mockParams, locals: mockLocals, url: mockUrl } as any);

      expect(result).toHaveProperty('error');
      expect(result.error).toBe('Failed');
    });
  });
});
