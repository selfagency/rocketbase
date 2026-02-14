import { RESERVED_ROUTE_SEGMENTS } from '$lib/server/page-fallthrough';
import type { RequestEvent } from '@sveltejs/kit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { load } from '../../../routes/[...slug]/+page.server';

describe('[slug] Fallthrough Route', () => {
  let mockLocals: any;
  let mockEvent: Partial<RequestEvent>;

  beforeEach(() => {
    mockLocals = {
      pb: {
        collection: vi.fn().mockReturnValue({
          getOne: vi.fn(),
        }),
      },
      user: null,
      logger: {
        withMetadata: vi.fn().mockReturnThis(),
        debug: vi.fn(),
      },
    };

    mockEvent = {
      locals: mockLocals,
      params: { slug: 'test-page' },
      url: new URL('http://localhost/test-page'),
    };
  });

  describe('Reserved routes', () => {
    it.each(RESERVED_ROUTE_SEGMENTS)('should return 404 for reserved route: %s', async reservedSlug => {
      mockEvent.params = { slug: reservedSlug };

      const mockParent = vi.fn().mockResolvedValue({
        navItems: [],
      });

      await expect(load({ ...mockEvent, parent: mockParent } as any)).rejects.toMatchObject({
        status: 404,
        body: { message: 'Page not found' },
      });
    });
  });

  describe('Page not found', () => {
    it('should return 404 when page is not in navigation', async () => {
      const mockParent = vi.fn().mockResolvedValue({
        navItems: [
          { id: '1', slug: 'home', title: 'Home' },
          { id: '2', slug: 'about', title: 'About' },
        ],
      });

      await expect(load({ ...mockEvent, parent: mockParent } as any)).rejects.toMatchObject({
        status: 404,
        body: { message: 'Page not found' },
      });
    });
  });

  describe('Hierarchical path construction', () => {
    it('should redirect when page has a parent', async () => {
      const mockParent = vi.fn().mockResolvedValue({
        navItems: [
          {
            id: '1',
            slug: 'about',
            title: 'About',
            children: [{ id: '2', slug: 'team', title: 'Team', parent: '1' }],
          },
        ],
      });

      mockEvent.params = { slug: 'about/team' };
      mockEvent.url = new URL('http://localhost/team');

      mockLocals.pb.collection().getOne.mockResolvedValue({
        id: '2',
        title: 'Team',
        slug: 'team',
        content: 'Team content',
        require_login: false,
        subscriber_only: false,
      });

      await expect(load({ ...mockEvent, parent: mockParent } as any)).rejects.toMatchObject({
        status: 301,
        location: '/about/team',
      });
    });

    it('should not redirect when path is already correct', async () => {
      const mockParent = vi.fn().mockResolvedValue({
        navItems: [
          {
            id: '1',
            slug: 'about',
            title: 'About',
            children: [{ id: '2', slug: 'team', title: 'Team', parent: '1' }],
          },
        ],
      });

      mockEvent.params = { slug: 'about/team' };
      mockEvent.url = new URL('http://localhost/about/team');

      mockLocals.pb.collection().getOne.mockResolvedValue({
        id: '2',
        title: 'Team',
        slug: 'team',
        content: 'Team content',
        require_login: false,
        subscriber_only: false,
      });

      const result = await load({ ...mockEvent, parent: mockParent } as any);
      expect(result).toEqual({
        page: {
          id: '2',
          title: 'Team',
          slug: 'team',
          content: 'Team content',
          require_login: false,
          subscriber_only: false,
        },
      });
    });
  });

  describe('Access control', () => {
    it('should return 403 for login-required pages when user is not authenticated', async () => {
      const mockParent = vi.fn().mockResolvedValue({
        navItems: [{ id: '1', slug: 'private', title: 'Private Page' }],
      });

      mockLocals.pb.collection().getOne.mockResolvedValue({
        id: '1',
        title: 'Private Page',
        slug: 'private',
        content: 'Private content',
        require_login: true,
        subscriber_only: false,
      });

      await expect(
        load({
          ...mockEvent,
          params: { slug: 'private' },
          url: new URL('http://localhost/private'),
          parent: mockParent,
        } as any)
      ).rejects.toMatchObject({
        status: 403,
        body: { message: 'Authentication required' },
      });
    });

    it('should return 403 for subscriber-only pages when user is not authenticated', async () => {
      const mockParent = vi.fn().mockResolvedValue({
        navItems: [{ id: '1', slug: 'premium', title: 'Premium Page' }],
      });

      mockLocals.pb.collection().getOne.mockResolvedValue({
        id: '1',
        title: 'Premium Page',
        slug: 'premium',
        content: 'Premium content',
        require_login: false,
        subscriber_only: true,
      });

      await expect(
        load({
          ...mockEvent,
          params: { slug: 'premium' },
          url: new URL('http://localhost/premium'),
          parent: mockParent,
        } as any)
      ).rejects.toMatchObject({
        status: 403,
        body: { message: 'Subscriber access required' },
      });
    });
  });

  describe('Successful page load', () => {
    it('should return page data for valid navigation item', async () => {
      const mockParent = vi.fn().mockResolvedValue({
        navItems: [{ id: '1', slug: 'test-page', title: 'Test Page' }],
      });

      mockLocals.pb.collection().getOne.mockResolvedValue({
        id: '1',
        title: 'Test Page',
        slug: 'test-page',
        content: 'Test content',
        summary: 'Test summary',
        image: 'test.jpg',
        media: ['media1.jpg', 'media2.jpg'],
        custom_css: 'body { color: red; }',
        created: '2024-01-01T00:00:00Z',
        updated: '2024-01-02T00:00:00Z',
        require_login: false,
        subscriber_only: false,
      });

      const result = await load({ ...mockEvent, parent: mockParent } as any);

      expect(result).toEqual({
        page: {
          id: '1',
          title: 'Test Page',
          slug: 'test-page',
          content: 'Test content',
          summary: 'Test summary',
          image: 'test.jpg',
          media: ['media1.jpg', 'media2.jpg'],
          custom_css: 'body { color: red; }',
          created: '2024-01-01T00:00:00Z',
          updated: '2024-01-02T00:00:00Z',
          require_login: false,
          subscriber_only: false,
        },
      });
    });
  });
});
