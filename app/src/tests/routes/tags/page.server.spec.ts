import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from '../../../routes/tags/+page.server';

describe('Tags Index Page Server Load', () => {
  let mockPb: any;
  let mockLogger: any;
  let mockLocals: any;

  beforeEach(() => {
    mockLogger = {
      withContext: vi.fn().mockReturnThis(),
      error: vi.fn(),
    };

    mockPb = {
      collection: vi.fn((name: string) => {
        if (name === 'tags') {
          return {
            getFullList: vi.fn().mockResolvedValue([
              { id: 'tag1', tag: 'technology', slug: 'technology' },
              { id: 'tag2', tag: 'programming', slug: 'programming' },
            ]),
          };
        }
        return {
          getList: vi.fn(),
        };
      }),
      authStore: {
        record: { id: 'test-user-id' },
      },
    };

    mockLocals = {
      pb: mockPb,
      logger: mockLogger,
      requestId: 'test-request-id',
    };
  });

  describe('successful tag loading', () => {
    it('loads all tags sorted alphabetically', async () => {
      const tagsCollection = {
        getFullList: vi.fn().mockResolvedValue([
          { id: 'tag1', tag: 'technology' },
          { id: 'tag2', tag: 'programming' },
        ]),
      };

      const postsCollection = {
        getList: vi.fn().mockResolvedValue({
          totalItems: 5,
        }),
      };

      mockPb.collection = vi.fn((name: string) => {
        if (name === 'tags') return tagsCollection;
        if (name === 'posts') return postsCollection;
      });

      const result: any = await load({ locals: mockLocals } as any);

      expect(tagsCollection.getFullList).toHaveBeenCalledWith({ sort: 'tag' });
      expect(result.tags).toHaveLength(2);
    });

    it('fetches post count for each tag', async () => {
      const tagsCollection = {
        getFullList: vi.fn().mockResolvedValue([{ id: 'tag1', tag: 'tech' }]),
      };

      const postsCollection = {
        getList: vi.fn().mockResolvedValue({ totalItems: 10 }),
      };

      mockPb.collection = vi.fn((name: string) => {
        if (name === 'tags') return tagsCollection;
        if (name === 'posts') return postsCollection;
      });

      const result: any = await load({ locals: mockLocals } as any);

      expect(postsCollection.getList).toHaveBeenCalledWith(
        1,
        1,
        expect.objectContaining({
          filter: 'published = true && tags.id ?= "tag1"',
          fields: 'id',
        })
      );
      expect(result.tags[0].postCount).toBe(10);
    });

    it('only counts published posts', async () => {
      const tagsCollection = {
        getFullList: vi.fn().mockResolvedValue([{ id: 'tag1', tag: 'tech' }]),
      };

      const postsCollection = {
        getList: vi.fn().mockResolvedValue({ totalItems: 5 }),
      };

      mockPb.collection = vi.fn((name: string) => {
        if (name === 'tags') return tagsCollection;
        if (name === 'posts') return postsCollection;
      });

      await load({ locals: mockLocals } as any);

      expect(postsCollection.getList).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.objectContaining({
          filter: expect.stringContaining('published = true'),
        })
      );
    });

    it('returns empty array when no tags exist', async () => {
      const tagsCollection = {
        getFullList: vi.fn().mockResolvedValue([]),
      };

      mockPb.collection = vi.fn(() => tagsCollection);

      const result: any = await load({ locals: mockLocals } as any);

      expect(result.tags).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('returns empty tags array on error', async () => {
      const tagsCollection = {
        getFullList: vi.fn().mockRejectedValue(new Error('Database error')),
      };

      mockPb.collection = vi.fn(() => tagsCollection);

      const result: any = await load({ locals: mockLocals } as any);

      expect(result.tags).toEqual([]);
    });

    it('logs error with context when loading fails', async () => {
      const error = new Error('Connection failed');
      const tagsCollection = {
        getFullList: vi.fn().mockRejectedValue(error),
      };

      mockPb.collection = vi.fn(() => tagsCollection);

      await load({ locals: mockLocals } as any);

      expect(mockLogger.withContext).toHaveBeenCalledWith({
        route: '/tags',
        userId: 'test-user-id',
        requestId: 'test-request-id',
      });
      expect(mockLogger.withContext).toHaveBeenCalledWith(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Error loading tags');
    });
  });
});
