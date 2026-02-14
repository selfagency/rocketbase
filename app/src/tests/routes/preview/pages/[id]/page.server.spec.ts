import { beforeEach, describe, expect, it, vi } from 'vitest';
import { load } from '../../../../../routes/preview/pages/[id]/+page.server';

vi.mock('$lib/paraglide/messages', () => ({
  'error.authentication_required': () => 'Authentication required',
  'error.page_not_found': () => 'Page not found',
  'error.subscriber_access_required': () => 'Subscriber required',
}));

describe('Preview Page Server Load', () => {
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
      getOne: vi.fn(),
      authStore: {
        record: { id: 'editor-user-id' },
      },
    };

    mockLocals = {
      pb: mockPb,
      logger: mockLogger,
      requestId: 'test-request-id',
      user: {
        id: 'editor-user-id',
        role: 'editor',
      },
    };

    mockUrl = new URL('https://example.com/preview/pages/page-123');
    mockParams = { id: 'page-123' };
  });

  it('requires authentication', async () => {
    mockLocals.user = null;

    await expect(load({ params: mockParams, locals: mockLocals, url: mockUrl } as any)).rejects.toMatchObject({
      status: 401,
    });

    expect(mockPb.collection).not.toHaveBeenCalled();
  });

  it('forbids contributor role from page previews', async () => {
    mockLocals.user = { id: 'contributor-user-id', role: 'contributor' };

    await expect(load({ params: mockParams, locals: mockLocals, url: mockUrl } as any)).rejects.toMatchObject({
      status: 403,
    });

    expect(mockPb.collection).not.toHaveBeenCalled();
  });

  it('allows editor and returns page preview', async () => {
    const mockPage = {
      id: 'page-123',
      slug: 'about',
      title: 'About',
      require_login: false,
      subscriber_only: false,
    };
    mockPb.getOne.mockResolvedValue(mockPage);

    const result: any = await load({ params: mockParams, locals: mockLocals, url: mockUrl } as any);

    expect(result.page).toEqual(mockPage);
    expect(mockPb.collection).toHaveBeenCalledWith('pages');
    expect(mockPb.getOne).toHaveBeenCalledWith('page-123', {
      fields: expect.any(String),
      expand: 'attachments',
    });
  });

  it('logs and throws 404 when page lookup fails', async () => {
    const lookupError = new Error('Not found');
    mockPb.getOne.mockRejectedValue(lookupError);

    await expect(load({ params: mockParams, locals: mockLocals, url: mockUrl } as any)).rejects.toMatchObject({
      status: 404,
    });

    expect(mockLogger.withContext).toHaveBeenCalledWith({
      route: '/preview/pages/page-123',
      userId: 'editor-user-id',
      requestId: 'test-request-id',
    });
    expect(mockLogger.withMetadata).toHaveBeenCalledWith(lookupError);
    expect(mockLogger.error).toHaveBeenCalledWith('Unable to fetch page preview');
  });
});
