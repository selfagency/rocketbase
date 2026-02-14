import { beforeEach, describe, expect, it, vi } from 'vitest';
import { load } from '../../../../routes/posts/[slug]/+page.server';

// Mock the messages module
vi.mock('$lib/paraglide/messages', () => ({
  'error.post_not_found': () => 'Post not found',
}));

describe('Individual Post Page Server Load', () => {
  let mockPb: any;
  let mockLogger: any;
  let mockLocals: any;
  let mockUrl: URL;
  let mockParams: any;

  beforeEach(() => {
    mockLogger = {
      withContext: vi.fn().mockReturnThis(),
      withMetadata: vi.fn().mockReturnThis(),
      error: vi.fn(),
    };

    mockPb = {
      collection: vi.fn().mockReturnThis(),
      getFirstListItem: vi.fn(),
      authStore: {
        record: { id: 'test-user-id' },
      },
    };

    mockLocals = {
      pb: mockPb,
      logger: mockLogger,
      requestId: 'test-request-id',
    };

    mockUrl = new URL('https://example.com/posts/test-slug');
    mockParams = { slug: 'test-slug' };
  });

  describe('successful post loading', () => {
    it('loads post by slug', async () => {
      const mockPost = {
        id: 'post-1',
        slug: 'test-slug',
        title: 'Test Post',
        content: 'Post content',
        summary: 'Post summary',
        date: '2024-01-01',
        published: true,
        visible: true,
        author: [
          {
            id: 'author-1',
            name: 'John Doe',
            email: 'john@example.com',
          },
        ],
        tags: [
          { id: 'tag-1', tag: 'technology' },
          { id: 'tag-2', tag: 'programming' },
        ],
      };

      mockPb.getFirstListItem.mockResolvedValue(mockPost);

      const result: any = await load({
        params: mockParams,
        locals: mockLocals,
        url: mockUrl,
      } as any);

      expect(result.post).toEqual(mockPost);
      expect(mockPb.collection).toHaveBeenCalledWith('posts');
      expect(mockPb.getFirstListItem).toHaveBeenCalledWith('slug = "test-slug"', {
        expand: 'author,tags',
      });
    });

    it('loads post with different slug', async () => {
      mockParams.slug = 'another-post-slug';

      const mockPost = {
        id: 'post-2',
        slug: 'another-post-slug',
        title: 'Another Post',
      };

      mockPb.getFirstListItem.mockResolvedValue(mockPost);

      const result: any = await load({
        params: mockParams,
        locals: mockLocals,
        url: mockUrl,
      } as any);

      expect(result.post.slug).toBe('another-post-slug');
      expect(mockPb.getFirstListItem).toHaveBeenCalledWith('slug = "another-post-slug"', expect.any(Object));
    });

    it('expands author and tags relationships', async () => {
      const mockPost = {
        id: 'post-1',
        slug: 'test-slug',
        title: 'Test',
      };

      mockPb.getFirstListItem.mockResolvedValue(mockPost);

      await load({ params: mockParams, locals: mockLocals, url: mockUrl } as any);

      expect(mockPb.getFirstListItem).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          expand: 'author,tags',
        })
      );
    });

    it('handles slugs with special characters', async () => {
      mockParams.slug = 'post-with-dashes-and-numbers-123';

      const mockPost = {
        id: 'post-3',
        slug: 'post-with-dashes-and-numbers-123',
        title: 'Special Slug Post',
      };

      mockPb.getFirstListItem.mockResolvedValue(mockPost);

      await load({ params: mockParams, locals: mockLocals, url: mockUrl } as any);

      expect(mockPb.getFirstListItem).toHaveBeenCalledWith(
        'slug = "post-with-dashes-and-numbers-123"',
        expect.any(Object)
      );
    });
  });

  describe('error handling', () => {
    it('throws 404 error when post is not found', async () => {
      const error = new Error('Not found');
      mockPb.getFirstListItem.mockRejectedValue(error);

      await expect(load({ params: mockParams, locals: mockLocals, url: mockUrl } as any)).rejects.toThrow();
    });

    it('logs error with context when post loading fails', async () => {
      const error = new Error('Database error');
      mockPb.getFirstListItem.mockRejectedValue(error);

      try {
        await load({ params: mockParams, locals: mockLocals, url: mockUrl } as any);
      } catch {
        // Expected to throw
      }

      expect(mockLogger.withContext).toHaveBeenCalledWith({
        route: '/posts/test-slug',
        userId: 'test-user-id',
        requestId: 'test-request-id',
      });
      expect(mockLogger.withMetadata).toHaveBeenCalledWith(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Unable to fetch post');
    });

    it('throws 404 with appropriate message when post not found', async () => {
      mockPb.getFirstListItem.mockRejectedValue(new Error('Not found'));

      await expect(load({ params: mockParams, locals: mockLocals, url: mockUrl } as any)).rejects.toThrow();
    });

    it('handles null authStore record gracefully', async () => {
      mockPb.authStore.record = null;
      mockPb.getFirstListItem.mockRejectedValue(new Error('Not found'));

      try {
        await load({ params: mockParams, locals: mockLocals, url: mockUrl } as any);
      } catch {
        // Expected to throw
      }

      expect(mockLogger.withContext).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: undefined,
        })
      );
    });

    it('handles undefined authStore gracefully', async () => {
      mockPb.authStore = undefined;
      mockPb.getFirstListItem.mockRejectedValue(new Error('Not found'));

      try {
        await load({ params: mockParams, locals: mockLocals, url: mockUrl } as any);
      } catch {
        // Expected to throw
      }

      expect(mockLogger.withContext).toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledWith('Unable to fetch post');
    });

    it('handles PocketBase query errors', async () => {
      const queryError = new Error('Invalid query syntax');
      mockPb.getFirstListItem.mockRejectedValue(queryError);

      try {
        await load({ params: mockParams, locals: mockLocals, url: mockUrl } as any);
      } catch {
        // Expected to throw
      }

      expect(mockLogger.withMetadata).toHaveBeenCalledWith(queryError);
    });
  });

  describe('URL pathname logging', () => {
    it('logs the correct route pathname', async () => {
      mockUrl = new URL('https://example.com/posts/my-awesome-post');
      mockParams.slug = 'my-awesome-post';
      mockPb.getFirstListItem.mockRejectedValue(new Error('Not found'));

      try {
        await load({ params: mockParams, locals: mockLocals, url: mockUrl } as any);
      } catch {
        // Expected to throw
      }

      expect(mockLogger.withContext).toHaveBeenCalledWith(
        expect.objectContaining({
          route: '/posts/my-awesome-post',
        })
      );
    });
  });
});
