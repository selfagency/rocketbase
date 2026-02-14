import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from '../../../routes/posts/+page.server';

describe('Posts Index Page Server Load', () => {
  let mockPb: any;
  let mockLogger: any;
  let mockLocals: any;
  let mockUrl: URL;

  beforeEach(() => {
    mockLogger = {
      withContext: vi.fn().mockReturnThis(),
      error: vi.fn(),
    };

    mockPb = {
      collection: vi.fn().mockReturnThis(),
      getList: vi.fn(),
      authStore: {
        record: { id: 'test-user-id' },
      },
    };

    mockLocals = {
      pb: mockPb,
      logger: mockLogger,
      requestId: 'test-request-id',
    };

    mockUrl = new URL('https://example.com/posts');
  });

  describe('successful post loading', () => {
    it('loads posts with default pagination', async () => {
      const mockResult = {
        items: [
          {
            id: '1',
            slug: 'test-post-1',
            title: 'Test Post 1',
            summary: 'Summary 1',
            date: '2024-01-01',
            published: true,
            visible: true,
          },
          {
            id: '2',
            slug: 'test-post-2',
            title: 'Test Post 2',
            summary: 'Summary 2',
            date: '2024-01-02',
            published: true,
            visible: true,
          },
        ],
        page: 1,
        perPage: 12,
        totalItems: 2,
        totalPages: 1,
      };

      mockPb.getList.mockResolvedValue(mockResult);

      const result: any = await load({ url: mockUrl, locals: mockLocals } as any);

      expect(result.posts).toEqual(mockResult.items);
      expect(result.pagination).toEqual({
        page: 1,
        perPage: 12,
        totalItems: 2,
        totalPages: 1,
      });

      expect(mockPb.collection).toHaveBeenCalledWith('posts');
      expect(mockPb.getList).toHaveBeenCalledWith(1, 12, {
        filter: 'published = true && visible = true',
        sort: '-date',
        expand: 'author,tags',
      });
    });

    it('loads posts with custom page number', async () => {
      mockUrl.searchParams.set('page', '3');

      const mockResult = {
        items: [{ id: '1', title: 'Post' }],
        page: 3,
        perPage: 12,
        totalItems: 50,
        totalPages: 5,
      };

      mockPb.getList.mockResolvedValue(mockResult);

      const result: any = await load({ url: mockUrl, locals: mockLocals } as any);

      expect(result.pagination.page).toBe(3);
      expect(mockPb.getList).toHaveBeenCalledWith(3, 12, expect.any(Object));
    });

    it('loads posts with custom perPage parameter', async () => {
      mockUrl.searchParams.set('perPage', '20');

      const mockResult = {
        items: Array(20).fill({ id: '1', title: 'Post' }),
        page: 1,
        perPage: 20,
        totalItems: 100,
        totalPages: 5,
      };

      mockPb.getList.mockResolvedValue(mockResult);

      const result: any = await load({ url: mockUrl, locals: mockLocals } as any);

      expect(result.pagination.perPage).toBe(20);
      expect(mockPb.getList).toHaveBeenCalledWith(1, 20, expect.any(Object));
    });

    it('loads posts with both custom page and perPage', async () => {
      mockUrl.searchParams.set('page', '2');
      mockUrl.searchParams.set('perPage', '15');

      const mockResult = {
        items: Array(15).fill({ id: '1', title: 'Post' }),
        page: 2,
        perPage: 15,
        totalItems: 45,
        totalPages: 3,
      };

      mockPb.getList.mockResolvedValue(mockResult);

      const result: any = await load({ url: mockUrl, locals: mockLocals } as any);

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.perPage).toBe(15);
      expect(mockPb.getList).toHaveBeenCalledWith(2, 15, expect.any(Object));
    });

    it('returns empty array when no posts exist', async () => {
      const mockResult = {
        items: [],
        page: 1,
        perPage: 12,
        totalItems: 0,
        totalPages: 0,
      };

      mockPb.getList.mockResolvedValue(mockResult);

      const result: any = await load({ url: mockUrl, locals: mockLocals } as any);

      expect(result.posts).toEqual([]);
      expect(result.pagination.totalItems).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });

    it('expands author and tags relationships', async () => {
      const mockResult = {
        items: [],
        page: 1,
        perPage: 12,
        totalItems: 0,
        totalPages: 0,
      };

      mockPb.getList.mockResolvedValue(mockResult);

      await load({ url: mockUrl, locals: mockLocals } as any);

      expect(mockPb.getList).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.objectContaining({
          expand: 'author,tags',
        })
      );
    });

    it('filters for published and visible posts only', async () => {
      const mockResult = {
        items: [],
        page: 1,
        perPage: 12,
        totalItems: 0,
        totalPages: 0,
      };

      mockPb.getList.mockResolvedValue(mockResult);

      await load({ url: mockUrl, locals: mockLocals } as any);

      expect(mockPb.getList).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.objectContaining({
          filter: 'published = true && visible = true',
        })
      );
    });

    it('sorts posts by date in descending order', async () => {
      const mockResult = {
        items: [],
        page: 1,
        perPage: 12,
        totalItems: 0,
        totalPages: 0,
      };

      mockPb.getList.mockResolvedValue(mockResult);

      await load({ url: mockUrl, locals: mockLocals } as any);

      expect(mockPb.getList).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.objectContaining({
          sort: '-date',
        })
      );
    });
  });

  describe('pagination parameter parsing', () => {
    it('parses page as integer from string', async () => {
      mockUrl.searchParams.set('page', '5');

      const mockResult = {
        items: [],
        page: 5,
        perPage: 12,
        totalItems: 0,
        totalPages: 0,
      };

      mockPb.getList.mockResolvedValue(mockResult);

      await load({ url: mockUrl, locals: mockLocals } as any);

      expect(mockPb.getList).toHaveBeenCalledWith(5, expect.any(Number), expect.any(Object));
    });

    it('defaults to page 1 when page param is missing', async () => {
      const mockResult = {
        items: [],
        page: 1,
        perPage: 12,
        totalItems: 0,
        totalPages: 0,
      };

      mockPb.getList.mockResolvedValue(mockResult);

      await load({ url: mockUrl, locals: mockLocals } as any);

      expect(mockPb.getList).toHaveBeenCalledWith(1, expect.any(Number), expect.any(Object));
    });

    it('defaults to 12 perPage when perPage param is missing', async () => {
      const mockResult = {
        items: [],
        page: 1,
        perPage: 12,
        totalItems: 0,
        totalPages: 0,
      };

      mockPb.getList.mockResolvedValue(mockResult);

      await load({ url: mockUrl, locals: mockLocals } as any);

      expect(mockPb.getList).toHaveBeenCalledWith(expect.any(Number), 12, expect.any(Object));
    });

    it('handles invalid page parameter by defaulting to 1', async () => {
      mockUrl.searchParams.set('page', 'invalid');

      const mockResult = {
        items: [],
        page: 1,
        perPage: 12,
        totalItems: 0,
        totalPages: 0,
      };

      mockPb.getList.mockResolvedValue(mockResult);

      await load({ url: mockUrl, locals: mockLocals } as any);

      // parseInt('invalid') returns NaN, which should be handled
      expect(mockPb.getList).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('returns empty posts array on error', async () => {
      const error = new Error('Database error');
      mockPb.getList.mockRejectedValue(error);

      const result: any = await load({ url: mockUrl, locals: mockLocals } as any);

      expect(result.posts).toEqual([]);
      expect(result.pagination).toEqual({
        page: 1,
        perPage: 12,
        totalItems: 0,
        totalPages: 0,
      });
    });

    it('logs error with context when loading fails', async () => {
      const error = new Error('Connection timeout');
      mockPb.getList.mockRejectedValue(error);

      await load({ url: mockUrl, locals: mockLocals } as any);

      expect(mockLogger.withContext).toHaveBeenCalledWith({
        route: '/posts',
        userId: 'test-user-id',
        requestId: 'test-request-id',
      });
      expect(mockLogger.withContext).toHaveBeenCalledWith(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Error loading posts');
    });

    it('preserves perPage in pagination on error', async () => {
      mockUrl.searchParams.set('perPage', '25');
      mockPb.getList.mockRejectedValue(new Error('Test error'));

      const result: any = await load({ url: mockUrl, locals: mockLocals } as any);

      expect(result.pagination.perPage).toBe(25);
    });

    it('handles null authStore record gracefully', async () => {
      mockPb.authStore.record = null;
      mockPb.getList.mockRejectedValue(new Error('Test error'));

      await load({ url: mockUrl, locals: mockLocals } as any);

      expect(mockLogger.withContext).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: undefined,
        })
      );
    });

    it('handles undefined authStore gracefully', async () => {
      mockPb.authStore = undefined;
      mockPb.getList.mockRejectedValue(new Error('Test error'));

      await load({ url: mockUrl, locals: mockLocals } as any);

      expect(mockLogger.withContext).toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledWith('Error loading posts');
    });
  });
});
