import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../../../../../routes/api/auth/confirm-verification/+server';

// Mock paraglide messages
vi.mock('$lib/paraglide/messages.js', () => ({
  'api.token_required': () => 'Token is required',
  'api.email_verification_failed': () => 'Email verification failed',
}));

describe('API Email Verification', () => {
  let mockLocals: any;
  let mockRequest: any;
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
        withMetadata: vi.fn().mockReturnThis(),
        withContext: vi.fn().mockReturnThis(),
        debug: vi.fn(),
        error: vi.fn(),
      },
      requestId: 'req-123',
    };

    mockUrl = {
      pathname: '/api/auth/confirm-verification',
    };

    vi.clearAllMocks();
  });

  describe('POST handler', () => {
    it('successfully confirms email verification with valid token', async () => {
      mockRequest = new Request('http://localhost/api/auth/confirm-verification', {
        method: 'POST',
        body: JSON.stringify({ token: 'valid-token-123' }),
        headers: { 'Content-Type': 'application/json' },
      });

      mockLocals.pb.collection().confirmVerification.mockResolvedValue(undefined);

      const response = await POST({ request: mockRequest, locals: mockLocals, url: mockUrl } as any);
      const data = await response.json();

      expect(mockLocals.pb.collection).toHaveBeenCalledWith('users');
      expect(mockLocals.pb.collection().confirmVerification).toHaveBeenCalledWith('valid-token-123');
      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        message: 'Email verified successfully',
      });
    });

    it('logs debug message when confirming verification', async () => {
      mockRequest = new Request('http://localhost/api/auth/confirm-verification', {
        method: 'POST',
        body: JSON.stringify({ token: 'test-token' }),
      });

      mockLocals.pb.collection().confirmVerification.mockResolvedValue(undefined);

      await POST({ request: mockRequest, locals: mockLocals, url: mockUrl } as any);

      expect(mockLocals.logger.withMetadata).toHaveBeenCalledWith('test-token');
      expect(mockLocals.logger.debug).toHaveBeenCalledWith('API: Confirming verification with token');
      expect(mockLocals.logger.debug).toHaveBeenCalledWith('API: Email verified successfully');
    });

    it('returns 400 error when token is missing', async () => {
      mockRequest = new Request('http://localhost/api/auth/confirm-verification', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST({ request: mockRequest, locals: mockLocals, url: mockUrl } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Token is required',
      });
      expect(mockLocals.pb.collection().confirmVerification).not.toHaveBeenCalled();
    });

    it('returns 400 error when token is null', async () => {
      mockRequest = new Request('http://localhost/api/auth/confirm-verification', {
        method: 'POST',
        body: JSON.stringify({ token: null }),
      });

      const response = await POST({ request: mockRequest, locals: mockLocals, url: mockUrl } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Token is required');
    });

    it('returns 400 error when token is empty string', async () => {
      mockRequest = new Request('http://localhost/api/auth/confirm-verification', {
        method: 'POST',
        body: JSON.stringify({ token: '' }),
      });

      const response = await POST({ request: mockRequest, locals: mockLocals, url: mockUrl } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Token is required');
    });

    it('handles PocketBase verification error', async () => {
      mockRequest = new Request('http://localhost/api/auth/confirm-verification', {
        method: 'POST',
        body: JSON.stringify({ token: 'invalid-token' }),
      });

      const pbError: any = new Error('Invalid or expired token');
      pbError.status = 400;
      mockLocals.pb.collection().confirmVerification.mockRejectedValue(pbError);

      const response = await POST({ request: mockRequest, locals: mockLocals, url: mockUrl } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid or expired token');
    });

    it('logs error context when verification fails', async () => {
      mockRequest = new Request('http://localhost/api/auth/confirm-verification', {
        method: 'POST',
        body: JSON.stringify({ token: 'bad-token' }),
      });

      const pbError = new Error('Token expired');
      mockLocals.pb.collection().confirmVerification.mockRejectedValue(pbError);

      await POST({ request: mockRequest, locals: mockLocals, url: mockUrl } as any);

      expect(mockLocals.logger.withContext).toHaveBeenCalledWith({
        route: '/api/auth/confirm-verification',
        userId: 'user123',
        requestId: 'req-123',
      });
      expect(mockLocals.logger.withMetadata).toHaveBeenCalledWith(pbError);
      expect(mockLocals.logger.error).toHaveBeenCalledWith('API: Email verification error');
    });

    it('uses default error message when PocketBase error has no message', async () => {
      mockRequest = new Request('http://localhost/api/auth/confirm-verification', {
        method: 'POST',
        body: JSON.stringify({ token: 'token' }),
      });

      mockLocals.pb.collection().confirmVerification.mockRejectedValue({});

      const response = await POST({ request: mockRequest, locals: mockLocals, url: mockUrl } as any);
      const data = await response.json();

      expect(data.error).toBe('Email verification failed');
    });

    it('uses default status 400 when PocketBase error has no status', async () => {
      mockRequest = new Request('http://localhost/api/auth/confirm-verification', {
        method: 'POST',
        body: JSON.stringify({ token: 'token' }),
      });

      mockLocals.pb.collection().confirmVerification.mockRejectedValue(new Error('Some error'));

      const response = await POST({ request: mockRequest, locals: mockLocals, url: mockUrl } as any);

      expect(response.status).toBe(400);
    });

    it('preserves PocketBase error status code', async () => {
      mockRequest = new Request('http://localhost/api/auth/confirm-verification', {
        method: 'POST',
        body: JSON.stringify({ token: 'token' }),
      });

      const pbError: any = new Error('Not found');
      pbError.status = 404;
      mockLocals.pb.collection().confirmVerification.mockRejectedValue(pbError);

      const response = await POST({ request: mockRequest, locals: mockLocals, url: mockUrl } as any);

      expect(response.status).toBe(404);
    });

    it('returns JSON content type for success response', async () => {
      mockRequest = new Request('http://localhost/api/auth/confirm-verification', {
        method: 'POST',
        body: JSON.stringify({ token: 'valid-token' }),
      });

      mockLocals.pb.collection().confirmVerification.mockResolvedValue(undefined);

      const response = await POST({ request: mockRequest, locals: mockLocals, url: mockUrl } as any);

      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('returns JSON content type for error response', async () => {
      mockRequest = new Request('http://localhost/api/auth/confirm-verification', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST({ request: mockRequest, locals: mockLocals, url: mockUrl } as any);

      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('handles malformed JSON in request body', async () => {
      mockRequest = new Request('http://localhost/api/auth/confirm-verification', {
        method: 'POST',
        body: 'not valid json',
      });

      const response = await POST({ request: mockRequest, locals: mockLocals, url: mockUrl } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('not valid JSON');
    });
  });
});
