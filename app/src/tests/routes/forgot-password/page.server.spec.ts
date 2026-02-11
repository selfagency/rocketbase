import type { RequestEvent } from '@sveltejs/kit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { actions } from '../../../routes/forgot-password/+page.server';

describe('Forgot Password Server Actions', () => {
  let mockLocals: any;
  let mockEvent: Partial<RequestEvent>;

  beforeEach(() => {
    const mockCollection = {
      requestPasswordReset: vi.fn(),
    };

    mockLocals = {
      pb: {
        collection: vi.fn(() => mockCollection),
      },
      logger: {
        withContext: vi.fn().mockReturnThis(),
        withMetadata: vi.fn().mockReturnThis(),
        error: vi.fn(),
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
      url: new URL('http://localhost/forgot-password'),
    };
  });

  describe('default action (request password reset)', () => {
    it('successfully sends password reset email', async () => {
      expect.assertions(3);

      const formData = new FormData();
      formData.append('email', 'test@example.com');

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      mockLocals.pb.collection().requestPasswordReset.mockResolvedValue({});

      const result: any = await actions.default(mockEvent as any);

      expect(result.success).toBe(true);
      expect(result.message).toContain('password reset link has been sent');
      expect(mockLocals.pb.collection().requestPasswordReset).toHaveBeenCalledWith('test@example.com');
    });

    it('validates email format', async () => {
      expect.assertions(1);

      const formData = new FormData();
      formData.append('email', 'invalid-email');

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      const result = await actions.default(mockEvent as any);

      expect(result).toHaveProperty('status', 400);
    });

    it('returns success message even on error (security)', async () => {
      expect.assertions(2);

      const formData = new FormData();
      formData.append('email', 'nonexistent@example.com');

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      mockLocals.pb.collection().requestPasswordReset.mockRejectedValue(new Error('User not found'));

      const result: any = await actions.default(mockEvent as any);

      // Should still return success to not reveal if email exists
      expect(result.success).toBe(true);
      expect(result.message).toContain('password reset link has been sent');
    });

    it('returns error when email field is empty', async () => {
      expect.assertions(1);

      const formData = new FormData();
      formData.append('email', '');

      mockEvent.request = new Request('http://localhost', {
        method: 'POST',
        body: formData,
      });

      const result = await actions.default(mockEvent as any);

      expect(result).toHaveProperty('status', 400);
    });
  });
});
