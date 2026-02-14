import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the redirect function
vi.mock('@sveltejs/kit', async () => {
  const actual = await vi.importActual('@sveltejs/kit');
  return {
    ...actual,
    redirect: vi.fn((status: number, location: string) => {
      throw { status, location, type: 'redirect' };
    }),
  };
});

// Mock PocketBase client
const mockPocketBaseClient = {
  collection: vi.fn(),
};

vi.mock('$lib/server/pocketbase', () => ({
  createPocketBaseClient: () => mockPocketBaseClient,
}));

// Mock logger
const mockLogger = {
  error: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  withContext: vi.fn().mockReturnThis(),
  withMetadata: vi.fn().mockReturnThis(),
};

vi.mock('$lib/server/logger', () => ({
  default: mockLogger,
}));

// Import the handle function after mocks are set up
const { handleRedirects } = await import('../../lib/server/redirect-handler');

describe('Redirect Handler', () => {
  let mockEvent: Partial<RequestEvent>;
  let mockResolve: ReturnType<typeof vi.fn>;
  let mockCollection: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCollection = {
      getFullList: vi.fn(),
    };

    mockPocketBaseClient.collection.mockReturnValue(mockCollection);

    mockResolve = vi.fn().mockResolvedValue(new Response('OK'));

    mockEvent = {
      url: new URL('http://localhost:5173/test-path'),
      locals: {} as any,
    };
  });

  describe('Path Skipping', () => {
    it('should skip redirects for API routes', async () => {
      mockEvent.url = new URL('http://localhost:5173/api/users');

      await handleRedirects({ event: mockEvent as RequestEvent, resolve: mockResolve });

      expect(mockCollection.getFullList).not.toHaveBeenCalled();
      expect(mockResolve).toHaveBeenCalled();
    });

    it('should skip redirects for static assets', async () => {
      mockEvent.url = new URL('http://localhost:5173/_app/immutable/assets/app.css');

      await handleRedirects({ event: mockEvent as RequestEvent, resolve: mockResolve });

      expect(mockCollection.getFullList).not.toHaveBeenCalled();
      expect(mockResolve).toHaveBeenCalled();
    });
  });

  describe('Redirect Matching', () => {
    it('should redirect when exact slug matches', async () => {
      mockEvent.url = new URL('http://localhost:5173/old-path');
      mockCollection.getFullList.mockResolvedValue([
        { id: '1', slug: 'old-path', url: '/new-path' },
      ]);

      await expect(
        handleRedirects({ event: mockEvent as RequestEvent, resolve: mockResolve })
      ).rejects.toMatchObject({
        status: 302,
        location: '/new-path',
        type: 'redirect',
      });
    });

    it('should redirect when slug matches with leading slash', async () => {
      mockEvent.url = new URL('http://localhost:5173/old-path');
      mockCollection.getFullList.mockResolvedValue([
        { id: '1', slug: '/old-path', url: '/new-path' },
      ]);

      await expect(
        handleRedirects({ event: mockEvent as RequestEvent, resolve: mockResolve })
      ).rejects.toMatchObject({
        status: 302,
        location: '/new-path',
        type: 'redirect',
      });
    });

    it('should redirect when slug matches with trailing slash', async () => {
      mockEvent.url = new URL('http://localhost:5173/old-path/');
      mockCollection.getFullList.mockResolvedValue([
        { id: '1', slug: 'old-path/', url: '/new-path' },
      ]);

      await expect(
        handleRedirects({ event: mockEvent as RequestEvent, resolve: mockResolve })
      ).rejects.toMatchObject({
        status: 302,
        location: '/new-path',
        type: 'redirect',
      });
    });

    it('should handle root path redirect', async () => {
      mockEvent.url = new URL('http://localhost:5173/');
      mockCollection.getFullList.mockResolvedValue([
        { id: '1', slug: '/', url: '/home' },
      ]);

      await expect(
        handleRedirects({ event: mockEvent as RequestEvent, resolve: mockResolve })
      ).rejects.toMatchObject({
        status: 302,
        location: '/home',
        type: 'redirect',
      });
    });

    it('should redirect to external URL', async () => {
      mockEvent.url = new URL('http://localhost:5173/external');
      mockCollection.getFullList.mockResolvedValue([
        { id: '1', slug: 'external', url: 'https://example.com' },
      ]);

      await expect(
        handleRedirects({ event: mockEvent as RequestEvent, resolve: mockResolve })
      ).rejects.toMatchObject({
        status: 302,
        location: 'https://example.com',
        type: 'redirect',
      });
    });

    it('should not redirect when no matching slug', async () => {
      mockEvent.url = new URL('http://localhost:5173/non-existent');
      mockCollection.getFullList.mockResolvedValue([
        { id: '1', slug: 'old-path', url: '/new-path' },
      ]);

      await handleRedirects({ event: mockEvent as RequestEvent, resolve: mockResolve });

      expect(mockResolve).toHaveBeenCalled();
      expect(redirect).not.toHaveBeenCalled();
    });

    it('should not redirect when slug is empty', async () => {
      mockEvent.url = new URL('http://localhost:5173/test-path');
      mockCollection.getFullList.mockResolvedValue([
        { id: '1', slug: '', url: '/new-path' },
        { id: '2', slug: null, url: '/another-path' },
      ]);

      await handleRedirects({ event: mockEvent as RequestEvent, resolve: mockResolve });

      expect(mockResolve).toHaveBeenCalled();
      expect(redirect).not.toHaveBeenCalled();
    });

    it('should not redirect when url is empty', async () => {
      mockEvent.url = new URL('http://localhost:5173/old-path');
      mockCollection.getFullList.mockResolvedValue([
        { id: '1', slug: 'old-path', url: '' },
      ]);

      await handleRedirects({ event: mockEvent as RequestEvent, resolve: mockResolve });

      expect(mockResolve).toHaveBeenCalled();
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle PocketBase query errors gracefully', async () => {
      mockEvent.url = new URL('http://localhost:5173/test-path');
      mockCollection.getFullList.mockRejectedValue(new Error('Database connection failed'));

      await handleRedirects({ event: mockEvent as RequestEvent, resolve: mockResolve });

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to check redirects',
        'Database connection failed'
      );
      expect(mockResolve).toHaveBeenCalled();
    });

    it('should handle non-Error exceptions', async () => {
      mockEvent.url = new URL('http://localhost:5173/test-path');
      mockCollection.getFullList.mockRejectedValue('String error');

      await handleRedirects({ event: mockEvent as RequestEvent, resolve: mockResolve });

      expect(mockLogger.error).toHaveBeenCalledWith('Failed to check redirects', 'String error');
      expect(mockResolve).toHaveBeenCalled();
    });
  });

  describe('Multiple Redirects', () => {
    it('should use the first matching redirect', async () => {
      mockEvent.url = new URL('http://localhost:5173/ambiguous');
      mockCollection.getFullList.mockResolvedValue([
        { id: '1', slug: 'ambiguous', url: '/first-match' },
        { id: '2', slug: 'ambiguous', url: '/second-match' },
      ]);

      await expect(
        handleRedirects({ event: mockEvent as RequestEvent, resolve: mockResolve })
      ).rejects.toMatchObject({
        status: 302,
        location: '/first-match',
        type: 'redirect',
      });
    });
  });

  describe('Query Filter', () => {
    it('should query redirects with non-empty slug filter', async () => {
      mockEvent.url = new URL('http://localhost:5173/test-path');
      mockCollection.getFullList.mockResolvedValue([]);

      await handleRedirects({ event: mockEvent as RequestEvent, resolve: mockResolve });

      expect(mockCollection.getFullList).toHaveBeenCalledWith({
        filter: 'slug != ""',
      });
    });
  });
});
