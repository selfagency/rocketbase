import { beforeEach, describe, expect, it, vi } from 'vitest';
import { load } from '../../../../../routes/preview/posts/[slug]/+page.server';

vi.mock('$lib/paraglide/messages', () => ({
  'error.authentication_required': () => 'Authentication required',
  'error.post_not_found': () => 'Post not found',
}));

describe('Preview Post Page Server Load', () => {
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
      user: {
        id: 'test-user-id',
        role: 'contributor',
      },
    };

    mockUrl = new URL('https://example.com/preview/posts/test-slug');
    mockParams = { slug: 'test-slug' };
  });

  it('requires authentication', async () => {
    mockLocals.user = null;

    await expect(load({ params: mockParams, locals: mockLocals, url: mockUrl } as any)).rejects.toMatchObject({
      status: 401,
    });

    expect(mockPb.collection).not.toHaveBeenCalled();
  });

  it('allows admin to preview any post', async () => {
    mockLocals.user = { id: 'admin-1', role: 'admin' };

    const mockPost = {
      id: 'post-1',
      slug: 'test-slug',
      author: ['author-xyz'],
    };
    mockPb.getFirstListItem.mockResolvedValue(mockPost);

    const result: any = await load({ params: mockParams, locals: mockLocals, url: mockUrl } as any);

    expect(result.post).toEqual(mockPost);
    expect(mockPb.getFirstListItem).toHaveBeenCalledWith('slug = "test-slug"', {
      expand: 'author,tags',
    });
  });

  it('allows contributor to preview their own post', async () => {
    const mockPost = {
      id: 'post-1',
      slug: 'test-slug',
      author: ['test-user-id'],
    };
    mockPb.getFirstListItem.mockResolvedValue(mockPost);

    const result: any = await load({ params: mockParams, locals: mockLocals, url: mockUrl } as any);

    expect(result.post).toEqual(mockPost);
  });

  it('allows contributor to preview post when author is expanded relation', async () => {
    const mockPost = {
      id: 'post-1',
      slug: 'test-slug',
      author: [],
      expand: {
        author: [{ id: 'test-user-id', name: 'Author' }],
      },
    };
    mockPb.getFirstListItem.mockResolvedValue(mockPost);

    const result: any = await load({ params: mockParams, locals: mockLocals, url: mockUrl } as any);

    expect(result.post).toEqual(mockPost);
  });

  it('forbids contributor from previewing someone else post', async () => {
    const mockPost = {
      id: 'post-1',
      slug: 'test-slug',
      author: ['different-user-id'],
    };
    mockPb.getFirstListItem.mockResolvedValue(mockPost);

    await expect(load({ params: mockParams, locals: mockLocals, url: mockUrl } as any)).rejects.toMatchObject({
      status: 403,
    });
  });

  it('logs and throws 404 when post lookup fails', async () => {
    const lookupError = new Error('Not found');
    mockPb.getFirstListItem.mockRejectedValue(lookupError);

    await expect(load({ params: mockParams, locals: mockLocals, url: mockUrl } as any)).rejects.toMatchObject({
      status: 404,
    });

    expect(mockLogger.withContext).toHaveBeenCalledWith({
      route: '/preview/posts/test-slug',
      userId: 'test-user-id',
      requestId: 'test-request-id',
    });
    expect(mockLogger.withMetadata).toHaveBeenCalledWith(lookupError);
    expect(mockLogger.error).toHaveBeenCalledWith('Unable to fetch post preview');
  });
});
