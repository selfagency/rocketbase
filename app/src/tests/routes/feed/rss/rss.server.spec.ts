import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../../../../routes/feed/rss/+server';

describe('RSS Feed Endpoint', () => {
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

    mockUrl = new URL('https://example.com/feed/rss');
  });

  describe('successful feed generation', () => {
    it('returns RSS XML with posts', async () => {
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
        ],
      };

      mockPb.getList.mockResolvedValue(mockPosts);

      const response = await GET({ locals: mockLocals, url: mockUrl } as any);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/xml');
      expect(response.headers.get('Cache-Control')).toBe('max-age=0, s-maxage=3600');

      const xml = await response.text();

      // Verify XML structure
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8" ?>');
      expect(xml).toContain('<rss version="2.0"');
      expect(xml).toContain('<channel>');
      expect(xml).toContain('</channel>');
      expect(xml).toContain('</rss>');

      // Verify feed metadata
      expect(xml).toContain('<title>Rocketbase</title>');
      expect(xml).toContain('<description>A production-ready full-stack application</description>');
      expect(xml).toContain('<link>https://example.com</link>');
      expect(xml).toContain('<atom:link href="https://example.com/feed/rss"');

      // Verify post item
      expect(xml).toContain('<item>');
      expect(xml).toContain('<title>Test Post</title>');
      expect(xml).toContain('<link>https://example.com/posts/test-post</link>');
      expect(xml).toContain('<guid isPermaLink="true">https://example.com/posts/test-post</guid>');
      expect(xml).toContain('<description><![CDATA[A test post summary]]></description>');
      expect(xml).toContain('<author>John Doe</author>');
      expect(xml).toContain('<category>technology</category>');
      expect(xml).toContain('<category>programming</category>');
      expect(xml).toContain('</item>');

      // Verify PocketBase was called correctly
      expect(mockPb.collection).toHaveBeenCalledWith('posts');
      expect(mockPb.getList).toHaveBeenCalledWith(1, 20, {
        filter: 'published = true && visible = true',
        sort: '-date',
        expand: 'author,tags',
      });
    });

    it('handles multiple posts correctly', async () => {
      const mockPosts = {
        items: [
          {
            id: '1',
            slug: 'first-post',
            title: 'First Post',
            summary: 'First summary',
            date: '2024-01-01T00:00:00.000Z',
            created: '2024-01-01T00:00:00.000Z',
            author: [{ id: 'a1', name: 'Author One', email: 'one@example.com' }],
            tags: [],
          },
          {
            id: '2',
            slug: 'second-post',
            title: 'Second Post',
            summary: 'Second summary',
            date: '2024-01-02T00:00:00.000Z',
            created: '2024-01-02T00:00:00.000Z',
            author: [{ id: 'a2', name: 'Author Two', email: 'two@example.com' }],
            tags: [],
          },
        ],
      };

      mockPb.getList.mockResolvedValue(mockPosts);

      const response = await GET({ locals: mockLocals, url: mockUrl } as any);
      const xml = await response.text();

      // Count number of <item> elements (should be 2)
      const itemMatches = xml.match(/<item>/g);
      expect(itemMatches).toHaveLength(2);

      expect(xml).toContain('first-post');
      expect(xml).toContain('second-post');
    });

    it('handles posts with multiple authors', async () => {
      const mockPosts = {
        items: [
          {
            id: '1',
            slug: 'multi-author-post',
            title: 'Multi Author Post',
            summary: 'Co-authored post',
            date: '2024-01-01T00:00:00.000Z',
            created: '2024-01-01T00:00:00.000Z',
            author: [
              { id: 'a1', name: 'Alice', email: 'alice@example.com' },
              { id: 'a2', name: 'Bob', email: 'bob@example.com' },
              { id: 'a3', name: '', email: 'charlie@example.com' },
            ],
            tags: [],
          },
        ],
      };

      mockPb.getList.mockResolvedValue(mockPosts);

      const response = await GET({ locals: mockLocals, url: mockUrl } as any);
      const xml = await response.text();

      // Authors should be comma-separated, with email fallback for empty names
      expect(xml).toContain('<author>Alice, Bob, charlie@example.com</author>');
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
      const xml = await response.text();

      expect(xml).toContain('<author>Admin</author>');
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
      const xml = await response.text();

      expect(xml).toContain('<author>Admin</author>');
    });

    it('handles posts without summaries', async () => {
      const mockPosts = {
        items: [
          {
            id: '1',
            slug: 'no-summary',
            title: 'No Summary Post',
            summary: null,
            date: '2024-01-01T00:00:00.000Z',
            created: '2024-01-01T00:00:00.000Z',
            author: [{ id: 'a1', name: 'John', email: 'john@example.com' }],
            tags: [],
          },
        ],
      };

      mockPb.getList.mockResolvedValue(mockPosts);

      const response = await GET({ locals: mockLocals, url: mockUrl } as any);
      const xml = await response.text();

      expect(xml).toContain('<description><![CDATA[]]></description>');
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
      const xml = await response.text();

      // Should not have any <category> elements
      expect(xml).not.toContain('<category>');
    });

    it('uses created date when date is null', async () => {
      const mockPosts = {
        items: [
          {
            id: '1',
            slug: 'no-date',
            title: 'No Date Post',
            summary: 'Post without explicit date',
            date: null,
            created: '2024-01-15T12:00:00.000Z',
            author: [{ id: 'a1', name: 'John', email: 'john@example.com' }],
            tags: [],
          },
        ],
      };

      mockPb.getList.mockResolvedValue(mockPosts);

      const response = await GET({ locals: mockLocals, url: mockUrl } as any);
      const xml = await response.text();

      const expectedDate = new Date('2024-01-15T12:00:00.000Z').toUTCString();
      expect(xml).toContain(`<pubDate>${expectedDate}</pubDate>`);
    });

    it('returns empty feed when no posts exist', async () => {
      mockPb.getList.mockResolvedValue({ items: [] });

      const response = await GET({ locals: mockLocals, url: mockUrl } as any);
      const xml = await response.text();

      expect(xml).toContain('<channel>');
      expect(xml).not.toContain('<item>');
      expect(xml).toContain('</channel>');
    });

    it('includes lastBuildDate in feed', async () => {
      mockPb.getList.mockResolvedValue({ items: [] });

      const response = await GET({ locals: mockLocals, url: mockUrl } as any);
      const xml = await response.text();

      expect(xml).toContain('<lastBuildDate>');
      expect(xml).toMatch(/<lastBuildDate>.*<\/lastBuildDate>/);
    });
  });

  describe('error handling', () => {
    it('returns 500 error when PocketBase throws error', async () => {
      const error = new Error('Database connection failed');
      mockPb.getList.mockRejectedValue(error);

      const response = await GET({ locals: mockLocals, url: mockUrl } as any);

      expect(response.status).toBe(500);
      expect(mockLogger.withContext).toHaveBeenCalledWith(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Error generating RSS feed');

      const text = await response.text();
      expect(text).toBe('Error generating feed');
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

      const customUrl = new URL('https://custom-domain.com/feed/rss');
      const response = await GET({ locals: mockLocals, url: customUrl } as any);
      const xml = await response.text();

      expect(xml).toContain('<link>https://custom-domain.com</link>');
      expect(xml).toContain('href="https://custom-domain.com/feed/rss"');
    });

    it('includes correct RSS version and namespace', async () => {
      mockPb.getList.mockResolvedValue({ items: [] });

      const response = await GET({ locals: mockLocals, url: mockUrl } as any);
      const xml = await response.text();

      expect(xml).toContain('<rss version="2.0"');
      expect(xml).toContain('xmlns:atom="http://www.w3.org/1999/xlink"');
    });

    it('includes site title and description', async () => {
      mockPb.getList.mockResolvedValue({ items: [] });

      const response = await GET({ locals: mockLocals, url: mockUrl } as any);
      const xml = await response.text();

      expect(xml).toContain('<title>Rocketbase</title>');
      expect(xml).toContain('<description>A production-ready full-stack application</description>');
    });

    it('includes atom:link self-reference', async () => {
      mockPb.getList.mockResolvedValue({ items: [] });

      const response = await GET({ locals: mockLocals, url: mockUrl } as any);
      const xml = await response.text();

      expect(xml).toContain('rel="self"');
      expect(xml).toContain('type="application/rss+xml"');
    });
  });

  describe('HTTP headers', () => {
    it('sets correct Content-Type header', async () => {
      mockPb.getList.mockResolvedValue({ items: [] });

      const response = await GET({ locals: mockLocals, url: mockUrl } as any);

      expect(response.headers.get('Content-Type')).toBe('application/xml');
    });

    it('sets cache control for 1 hour on CDN', async () => {
      mockPb.getList.mockResolvedValue({ items: [] });

      const response = await GET({ locals: mockLocals, url: mockUrl } as any);

      expect(response.headers.get('Cache-Control')).toBe('max-age=0, s-maxage=3600');
    });
  });

  describe('XML escaping and CDATA', () => {
    it('wraps summary in CDATA section', async () => {
      const mockPosts = {
        items: [
          {
            id: '1',
            slug: 'test',
            title: 'Test',
            summary: 'Summary with <html> & special chars',
            date: '2024-01-01T00:00:00.000Z',
            created: '2024-01-01T00:00:00.000Z',
            author: [{ id: 'a1', name: 'John', email: 'john@example.com' }],
            tags: [],
          },
        ],
      };

      mockPb.getList.mockResolvedValue(mockPosts);

      const response = await GET({ locals: mockLocals, url: mockUrl } as any);
      const xml = await response.text();

      expect(xml).toContain('<![CDATA[Summary with <html> & special chars]]>');
    });
  });
});
