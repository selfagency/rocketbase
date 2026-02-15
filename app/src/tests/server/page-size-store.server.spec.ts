import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('page-size-store', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('refreshes page sizes from metadata via getFullList', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000);

    const { refreshPageSizesFromMetadata } = await import('../../lib/server/page-size-store');

    const pb = {
      collection: vi.fn(() => ({
        getFullList: vi.fn().mockResolvedValue([
          { key: 'admin_posts_per_page', value: '25' },
          { key: 'posts_per_page', value: '18' },
        ]),
      })),
    };

    const result = await refreshPageSizesFromMetadata(pb as any);

    expect(result).toEqual({
      adminPostsPerPage: 25,
      postsPerPage: 18,
      loadedAt: 1_000,
    });
  });

  it('supports metadata getList fallback', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(2_000);

    const { refreshPageSizesFromMetadata } = await import('../../lib/server/page-size-store');

    const pb = {
      collection: vi.fn(() => ({
        getList: vi.fn().mockResolvedValue({
          items: [{ key: 'posts_per_page', value: '30' }],
        }),
      })),
    };

    const result = await refreshPageSizesFromMetadata(pb as any);
    expect(result.adminPostsPerPage).toBe(10);
    expect(result.postsPerPage).toBe(30);
  });

  it('returns cached value when within TTL', async () => {
    const { refreshPageSizesFromMetadata, getServerPageSizes } = await import('../../lib/server/page-size-store');

    vi.spyOn(Date, 'now').mockReturnValue(10_000);
    await refreshPageSizesFromMetadata({
      collection: () => ({
        getFullList: vi.fn().mockResolvedValue([{ key: 'posts_per_page', value: '20' }]),
      }),
    } as any);

    vi.spyOn(Date, 'now').mockReturnValue(10_100);
    const pb = {
      collection: vi.fn(() => ({ getFullList: vi.fn() })),
    };

    const result = await getServerPageSizes(pb as any);
    expect(result.postsPerPage).toBe(20);
    expect(pb.collection).not.toHaveBeenCalled();
  });

  it('returns fallback values when refresh throws', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(100_000);

    const { getServerPageSizes } = await import('../../lib/server/page-size-store');

    const result = await getServerPageSizes({
      collection: () => ({
        getFullList: vi.fn().mockRejectedValue(new Error('metadata unavailable')),
      }),
    } as any);

    expect(result.adminPostsPerPage).toBeGreaterThan(0);
    expect(result.postsPerPage).toBeGreaterThan(0);
  });
});
