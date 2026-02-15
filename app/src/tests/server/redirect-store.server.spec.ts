import { beforeEach, describe, expect, it, vi } from 'vitest';

const getFullList = vi.fn();
const createPocketBaseClient = vi.fn(() => ({
  collection: vi.fn(() => ({ getFullList })),
}));

vi.mock('$lib/server/pocketbase', () => ({
  createPocketBaseClient,
}));

describe('redirect-store', () => {
  beforeEach(async () => {
    vi.resetModules();
    getFullList.mockReset();
    createPocketBaseClient.mockClear();
  });

  it('fetches and caches redirects', async () => {
    const { clearRedirectCache, getCachedRedirects } = await import('../../lib/server/redirect-store');
    clearRedirectCache();

    getFullList.mockResolvedValue([{ slug: 'old', url: '/new' }]);
    const first = await getCachedRedirects();
    const second = await getCachedRedirects();

    expect(first).toEqual([{ slug: 'old', url: '/new' }]);
    expect(second).toEqual(first);
    expect(getFullList).toHaveBeenCalledTimes(1);
  });

  it('refetches when force=true', async () => {
    const { clearRedirectCache, getCachedRedirects } = await import('../../lib/server/redirect-store');
    clearRedirectCache();

    getFullList.mockResolvedValueOnce([{ slug: 'a', url: '/a' }]).mockResolvedValueOnce([{ slug: 'b', url: '/b' }]);

    const first = await getCachedRedirects();
    const second = await getCachedRedirects(true);

    expect(first).toEqual([{ slug: 'a', url: '/a' }]);
    expect(second).toEqual([{ slug: 'b', url: '/b' }]);
    expect(getFullList).toHaveBeenCalledTimes(2);
  });
});
