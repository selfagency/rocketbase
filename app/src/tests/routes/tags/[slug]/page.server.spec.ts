import { beforeEach, describe, expect, it, vi } from 'vitest';
import { load } from '../../../../routes/tags/[slug]/+page.server';

describe('Individual Tag Page Server Load', () => {
  let mockPb: any;
  let mockLogger: any;
  let mockLocals: any;
  let mockUrl: URL;
  let mockParams: any;

  beforeEach(() => {
    mockLogger = {
      withContext: vi.fn().mockReturnThis(),
      error: vi.fn(),
    };

    mockPb = {
      collection: vi.fn(),
      authStore: {
        record: { id: 'test-user-id' },
      },
    };

    mockLocals = {
      pb: mockPb,
      logger: mockLogger,
      requestId: 'test-request-id',
    };

    mockUrl = new URL('https://example.com/tags/technology');
    mockParams = { slug: 'technology' };
  });

  describe('successful tag and posts loading', () => {
    it('loads tag by slug and associated posts', async () => {
      const mockTag = { id: 'tag1', tag: 'Technology', slug: 'technology' };
      const mockPosts = {
        items: [
          { id: 'post1', title: 'Post 1' },
          { id: 'post2', title: 'Post 2' },
        ],
        page: 1,
        perPage: 10,
        totalItems: 2,
        totalPages: 1,
      };

      const tagsCollection = {
        getFirstListItem: vi.fn().mockResolvedValue(mockTag),
      };
      const postsCollection = {
        getList: vi.fn().mockResolvedValue(mockPosts),
      };

      mockPb.collection = vi.fn((name: string) => {
        if (name === 'tags') return tagsCollection;
        if (name === 'posts') return postsCollection;
      });

      const result: any = await load({
        params: mockParams,
        url: mockUrl,
        locals: mockLocals,
      } as any);

      expect(result.tag).toEqual(mockTag);
      expect(result.posts).toEqual(mockPosts.items);
      expect(result.pagination).toEqual({
        page: 1,
        perPage: 10,
        totalItems: 2,
        totalPages: 1,
      });

      expect(tagsCollection.getFirstListItem).toHaveBeenCalledWith('slug = "technology"');
      expect(postsCollection.getList).toHaveBeenCalledWith(
        1,
        10,
        expect.objectContaining({
          filter: 'tags.id ?= "tag1" && published = true && visible = true',
          sort: '-created',
          expand: 'author,tags',
        })
      );
    });

    it('uses custom page and perPage parameters', async () => {
      mockUrl.searchParams.set('page', '2');
      mockUrl.searchParams.set('perPage', '20');

      const mockTag = { id: 'tag1', tag: 'Tech', slug: 'tech' };
      const mockPosts = {
        items: [],
        page: 2,
        perPage: 20,
        totalItems: 50,
        totalPages: 3,
      };

      const tagsCollection = {
        getFirstListItem: vi.fn().mockResolvedValue(mockTag),
      };
      const postsCollection = {
        getList: vi.fn().mockResolvedValue(mockPosts),
      };

      mockPb.collection = vi.fn((name: string) => {
        if (name === 'tags') return tagsCollection;
        if (name === 'posts') return postsCollection;
      });

      const result: any = await load({
        params: mockParams,
        url: mockUrl,
        locals: mockLocals,
      } as any);

      expect(postsCollection.getList).toHaveBeenCalledWith(2, 20, expect.any(Object));
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.perPage).toBe(20);
    });

    it('only shows published and visible posts', async () => {
      const mockTag = { id: 'tag1', tag: 'Tech', slug: 'tech' };
      const tagsCollection = {
        getFirstListItem: vi.fn().mockResolvedValue(mockTag),
      };
      const postsCollection = {
        getList: vi.fn().mockResolvedValue({ items: [], page: 1, perPage: 10, totalItems: 0, totalPages: 0 }),
      };

      mockPb.collection = vi.fn((name: string) => {
        if (name === 'tags') return tagsCollection;
        if (name === 'posts') return postsCollection;
      });

      await load({ params: mockParams, url: mockUrl, locals: mockLocals } as any);

      expect(postsCollection.getList).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.objectContaining({
          filter: expect.stringContaining('published = true && visible = true'),
        })
      );
    });

    it('expands author and tags for posts', async () => {
      const mockTag = { id: 'tag1', tag: 'Tech', slug: 'tech' };
      const tagsCollection = {
        getFirstListItem: vi.fn().mockResolvedValue(mockTag),
      };
      const postsCollection = {
        getList: vi.fn().mockResolvedValue({ items: [], page: 1, perPage: 10, totalItems: 0, totalPages: 0 }),
      };

      mockPb.collection = vi.fn((name: string) => {
        if (name === 'tags') return tagsCollection;
        if (name === 'posts') return postsCollection;
      });

      await load({ params: mockParams, url: mockUrl, locals: mockLocals } as any);

      expect(postsCollection.getList).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.objectContaining({
          expand: 'author,tags',
        })
      );
    });

    it('sorts posts by created date descending', async () => {
      const mockTag = { id: 'tag1', tag: 'Tech', slug: 'tech' };
      const tagsCollection = {
        getFirstListItem: vi.fn().mockResolvedValue(mockTag),
      };
      const postsCollection = {
        getList: vi.fn().mockResolvedValue({ items: [], page: 1, perPage: 10, totalItems: 0, totalPages: 0 }),
      };

      mockPb.collection = vi.fn((name: string) => {
        if (name === 'tags') return tagsCollection;
        if (name === 'posts') return postsCollection;
      });

      await load({ params: mockParams, url: mockUrl, locals: mockLocals } as any);

      expect(postsCollection.getList).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.objectContaining({
          sort: '-created',
        })
      );
    });
  });

  describe('error handling', () => {
    it('throws 404 when tag is not found', async () => {
      const tagsCollection = {
        getFirstListItem: vi.fn().mockRejectedValue(new Error('Not found')),
      };

      mockPb.collection = vi.fn(() => tagsCollection);

      await expect(load({ params: mockParams, url: mockUrl, locals: mockLocals } as any)).rejects.toThrow();
    });

    it('logs error with context when loading fails', async () => {
      const error = new Error('Database error');
      const tagsCollection = {
        getFirstListItem: vi.fn().mockRejectedValue(error),
      };

      mockPb.collection = vi.fn(() => tagsCollection);

      try {
        await load({ params: mockParams, url: mockUrl, locals: mockLocals } as any);
      } catch {
        // Expected to throw
      }

      expect(mockLogger.withContext).toHaveBeenCalledWith({
        route: '/tags/technology',
        userId: 'test-user-id',
        requestId: 'test-request-id',
      });
      expect(mockLogger.withContext).toHaveBeenCalledWith(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Error loading tag or posts');
    });
  });
});
