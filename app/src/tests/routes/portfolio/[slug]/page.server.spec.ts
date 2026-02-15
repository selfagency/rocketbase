import { describe, expect, it, vi } from 'vitest';
import { load } from '../../../../routes/portfolio/[slug]/+page.server';

describe('portfolio [slug] server load', () => {
  function createLocals(overrides?: { item?: any; getFirstListItemError?: Error; mediaRecords?: any[] }) {
    const portfolioService = {
      getFirstListItem: vi.fn(),
    };

    const mediaService = {
      getFullList: vi.fn(),
    };

    if (overrides?.getFirstListItemError) {
      portfolioService.getFirstListItem.mockRejectedValue(overrides.getFirstListItemError);
    } else {
      portfolioService.getFirstListItem.mockResolvedValue(
        overrides?.item ?? {
          id: 'portfolio-1',
          slug: 'test-project',
          title: 'Test Project',
          media: [],
          expand: { media: [] },
        }
      );
    }

    mediaService.getFullList.mockResolvedValue(overrides?.mediaRecords ?? []);

    const pb = {
      collection: vi.fn((name: string) => {
        if (name === 'portfolio') return portfolioService;
        if (name === 'media') return mediaService;
        throw new Error(`Unexpected collection: ${name}`);
      }),
      authStore: {
        record: { id: 'test-user-id' },
      },
    };

    const logger = {
      withContext: vi.fn().mockReturnThis(),
      withMetadata: vi.fn().mockReturnThis(),
      error: vi.fn(),
    };

    return {
      locals: {
        pb,
        logger,
        requestId: 'req-1',
      },
      portfolioService,
      mediaService,
      logger,
    };
  }

  it('returns expanded media from the portfolio query when present', async () => {
    const { locals, mediaService } = createLocals({
      item: {
        id: 'portfolio-1',
        slug: 'test-project',
        title: 'Test Project',
        media: ['m1', 'm2'],
        expand: {
          media: [{ id: 'm1' }, { id: 'm2' }],
        },
      },
    });

    const result: any = await load({
      params: { slug: 'test-project' },
      locals,
      url: new URL('https://example.com/portfolio/test-project'),
    } as any);

    expect(result.item.expand.media).toHaveLength(2);
    expect(mediaService.getFullList).not.toHaveBeenCalled();
  });

  it('hydrates media from relation ids when expand.media is missing', async () => {
    const { locals, mediaService } = createLocals({
      item: {
        id: 'portfolio-1',
        slug: 'test-project',
        title: 'Test Project',
        media: ['m2', 'm1'],
        expand: {},
      },
      mediaRecords: [
        { id: 'm1', file: 'one.jpg' },
        { id: 'm2', file: 'two.jpg' },
      ],
    });

    const result: any = await load({
      params: { slug: 'test-project' },
      locals,
      url: new URL('https://example.com/portfolio/test-project'),
    } as any);

    expect(mediaService.getFullList).toHaveBeenCalledWith({
      filter: 'id = "m2" || id = "m1"',
    });
    expect(result.item.expand.media).toEqual([
      { id: 'm2', file: 'two.jpg' },
      { id: 'm1', file: 'one.jpg' },
    ]);
  });

  it('logs and throws 404 when the portfolio item is not found', async () => {
    const notFoundError = new Error('Not found');
    const { locals, logger } = createLocals({ getFirstListItemError: notFoundError });

    await expect(
      load({
        params: { slug: 'missing-project' },
        locals,
        url: new URL('https://example.com/portfolio/missing-project'),
      } as any)
    ).rejects.toThrow();

    expect(logger.withContext).toHaveBeenCalledWith({
      route: '/portfolio/missing-project',
      userId: 'test-user-id',
      requestId: 'req-1',
    });
    expect(logger.withMetadata).toHaveBeenCalledWith(notFoundError);
    expect(logger.error).toHaveBeenCalledWith('Unable to fetch portfolio item');
  });
});
