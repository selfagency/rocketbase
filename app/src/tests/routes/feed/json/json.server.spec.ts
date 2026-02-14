import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../../../../routes/feed/json/+server';

describe('JSON Feed Endpoint', () => {
  let mockPb: any;
  let mockLogger: any;
  let mockLocals: any;
  let mockUrl: URL;

  beforeEach(() => {
    // Reset mocks before each test
    mockLogger = {
      withContext: vi.fn().mockReturnThis(),
      error: vi.fn(),
    };

    mockPb = {
      collection: vi.fn().mockReturnThis(),
      getList: vi.fn(),
    };

    mockLocals = {
      pb: mockPb,
      logger: mockLogger,
    };

    mockUrl = new URL('https://example.com/feed/json');
  });

  describe('successful feed generation', () => {
    it('returns JSON feed with posts', async () => {
      const mockPosts = {
        items: [
          {
            id: '1',
            slug: 'test-post',
            title: 'Test Post',
            summary: 'A test post summary',
            date: '2024-01-01T00:00:00.000Z',
            created: '2024-01-01T00:00:00.000Z',
            author: [
              {
                id: 'author1',
                name: 'John Doe',
                email: 'john@example.com',
              },
            ],
            tags: [
              {
                id: 'tag1',
                tag: 'technology',
              },
              {
                id: 'tag2',
                tag: 'programming',
              },
            ],
          },
          {
            id: '2',
            slug: 'another-post',
            title: 'Another Post',
            summary: '',
            date: null,
            created: '2024-01-02T00:00:00.000Z',
            author: [
              {
                id: 'author2',
                name: '',
                email: 'jane@example.com',
              },
            ],
            tags: [],
          },
        ],
      };

      mockPb.getList.mockResolvedValue(mockPosts);

      const response = await GET({ locals: mockLocals, url: mockUrl } as any);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(response.headers.get('Cache-Control')).toBe('max-age=0, s-maxage=3600');

      const data = await response.json();

      expect(data).toMatchObject({
        version: 'https://jsonfeed.org/version/1.1',
        title: 'Rocketbase',
        home_page_url: 'https://example.com',
        feed_url: 'https://example.com/feed/json',
        description: 'A production-ready full-stack application',
      });

      expect(data.items).toHaveLength(2);

      // Verify first item
      expect(data.items[0]).toMatchObject({
        id: 'https://example.com/posts/test-post',
        url: 'https://example.com/posts/test-post',
        title: 'Test Post',
        content_text: 'A test post summary',
        date_published: '2024-01-01T00:00:00.000Z',
        authors: [
          {
            name: 'John Doe',
            url: 'https://example.com/authors/author1',
          },
        ],
        tags: ['technology', 'programming'],
      });

      // Verify second item (with fallbacks)
      expect(data.items[1]).toMatchObject({
        id: 'https://example.com/posts/another-post',
        url: 'https://example.com/posts/another-post',
        title: 'Another Post',
        content_text: '',
        date_published: '2024-01-02T00:00:00.000Z',
        authors: [
          {
            name: 'jane@example.com', // Falls back to email when name is empty
            url: 'https://example.com/authors/author2',
          },
        ],
        tags: [],
      });

      // Verify PocketBase was called correctly
      expect(mockPb.collection).toHaveBeenCalledWith('posts');
      expect(mockPb.getList).toHaveBeenCalledWith(1, 20, {
        filter: 'published = true && visible = true',
        sort: '-date',
        expand: 'author,tags',
      });
    });

    it('handles posts with no authors by providing default', async () => {
      const mockPosts = {
        items: [
          {
            id: '1',
            slug: 'orphan-post',
            title: 'Orphan Post',
            summary: 'A post without authors',
            date: '2024-01-01T00:00:00.000Z',
            created: '2024-01-01T00:00:00.000Z',
            author: null,
            tags: [],
          },
        ],
      };

      mockPb.getList.mockResolvedValue(mockPosts);

      const response = await GET({ locals: mockLocals, url: mockUrl } as any);
      const data = await response.json();

      expect(data.items[0].authors).toEqual([{ name: 'Admin' }]);
    });

    it('handles posts with undefined authors by providing default', async () => {
      const mockPosts = {
        items: [
          {
            id: '1',
            slug: 'orphan-post',
            title: 'Orphan Post',
            summary: 'A post without authors',
            date: '2024-01-01T00:00:00.000Z',
            created: '2024-01-01T00:00:00.000Z',
            tags: [],
          },
        ],
      };

      mockPb.getList.mockResolvedValue(mockPosts);

      const response = await GET({ locals: mockLocals, url: mockUrl } as any);
      const data = await response.json();

      expect(data.items[0].authors).toEqual([{ name: 'Admin' }]);
    });

    it('handles posts with empty tags array', async () => {
      const mockPosts = {
        items: [
          {
            id: '1',
            slug: 'no-tags-post',
            title: 'Post Without Tags',
            summary: 'A post without tags',
            date: '2024-01-01T00:00:00.000Z',
            created: '2024-01-01T00:00:00.000Z',
            author: [{ id: 'author1', name: 'John', email: 'john@example.com' }],
            tags: null,
          },
        ],
      };

      mockPb.getList.mockResolvedValue(mockPosts);

      const response = await GET({ locals: mockLocals, url: mockUrl } as any);
      const data = await response.json();

      expect(data.items[0].tags).toEqual([]);
    });

    it('returns empty items array when no posts exist', async () => {
      mockPb.getList.mockResolvedValue({ items: [] });

      const response = await GET({ locals: mockLocals, url: mockUrl } as any);
      const data = await response.json();

      expect(data.items).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('returns 500 error when PocketBase throws error', async () => {
      const error = new Error('Database connection failed');
      mockPb.getList.mockRejectedValue(error);

      const response = await GET({ locals: mockLocals, url: mockUrl } as any);

      expect(response.status).toBe(500);
      expect(mockLogger.withContext).toHaveBeenCalledWith(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Error generating JSON feed');

      const data = await response.json();
      expect(data).toEqual({ error: 'Error generating feed' });
    });

    it('returns 500 error for network failures', async () => {
      mockPb.getList.mockRejectedValue(new Error('Network timeout'));

      const response = await GET({ locals: mockLocals, url: mockUrl } as any);

      expect(response.status).toBe(500);
    });

    it('logs error context when generation fails', async () => {
      const error = new Error('Parse error');
      mockPb.getList.mockRejectedValue(error);

      await GET({ locals: mockLocals, url: mockUrl } as any);

      expect(mockLogger.withContext).toHaveBeenCalledWith(error);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('feed metadata', () => {
    it('uses correct origin from URL', async () => {
      mockPb.getList.mockResolvedValue({ items: [] });

      const customUrl = new URL('https://custom-domain.com/feed/json');
      const response = await GET({ locals: mockLocals, url: customUrl } as any);
      const data = await response.json();

      expect(data.home_page_url).toBe('https://custom-domain.com');
      expect(data.feed_url).toBe('https://custom-domain.com/feed/json');
    });

    it('includes correct JSON Feed version', async () => {
      mockPb.getList.mockResolvedValue({ items: [] });

      const response = await GET({ locals: mockLocals, url: mockUrl } as any);
      const data = await response.json();

      expect(data.version).toBe('https://jsonfeed.org/version/1.1');
    });

    it('includes site title and description', async () => {
      mockPb.getList.mockResolvedValue({ items: [] });

      const response = await GET({ locals: mockLocals, url: mockUrl } as any);
      const data = await response.json();

      expect(data.title).toBe('Rocketbase');
      expect(data.description).toBe('A production-ready full-stack application');
    });
  });

  describe('HTTP headers', () => {
    it('sets correct Content-Type header', async () => {
      mockPb.getList.mockResolvedValue({ items: [] });

      const response = await GET({ locals: mockLocals, url: mockUrl } as any);

      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('sets cache control for 1 hour on CDN', async () => {
      mockPb.getList.mockResolvedValue({ items: [] });

      const response = await GET({ locals: mockLocals, url: mockUrl } as any);

      expect(response.headers.get('Cache-Control')).toBe('max-age=0, s-maxage=3600');
    });
  });
});
