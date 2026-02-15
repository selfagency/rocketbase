import { beforeEach, describe, expect, it, vi } from 'vitest';

const getCachedRedirects = vi.fn();
const loggerError = vi.fn();

vi.mock('../../lib/server/redirect-store', () => ({
  getCachedRedirects,
}));

vi.mock('$lib/server/logger', () => ({
  default: {
    error: loggerError,
  },
}));

describe('redirect-handler', () => {
  beforeEach(() => {
    vi.resetModules();
    getCachedRedirects.mockReset();
    loggerError.mockReset();
  });

  function event(pathname: string) {
    return {
      url: new URL(`http://localhost${pathname}`),
    } as any;
  }

  it('skips api and app asset routes', async () => {
    const { handleRedirects } = await import('../../lib/server/redirect-handler');
    const resolve = vi.fn().mockResolvedValue(new Response('ok'));

    await handleRedirects({ event: event('/api/test'), resolve } as any);
    await handleRedirects({ event: event('/_app/immutable/x.js'), resolve } as any);

    expect(resolve).toHaveBeenCalledTimes(2);
    expect(getCachedRedirects).not.toHaveBeenCalled();
  });

  it('throws redirect when cache contains matching slug', async () => {
    const { handleRedirects } = await import('../../lib/server/redirect-handler');
    getCachedRedirects.mockResolvedValue([{ slug: 'old-path', url: '/new-path' }]);

    try {
      await handleRedirects({ event: event('/old-path'), resolve: vi.fn() } as any);
      throw new Error('expected redirect');
    } catch (error: any) {
      expect(error.status).toBe(302);
      expect(error.location).toBe('/new-path');
    }
  });

  it('force-refreshes once when first cache lookup misses', async () => {
    const { handleRedirects } = await import('../../lib/server/redirect-handler');
    getCachedRedirects.mockResolvedValueOnce([]).mockResolvedValueOnce([{ slug: 'late-path', url: '/arrived-late' }]);

    try {
      await handleRedirects({ event: event('/late-path'), resolve: vi.fn() } as any);
      throw new Error('expected redirect');
    } catch (error: any) {
      expect(error.status).toBe(302);
      expect(error.location).toBe('/arrived-late');
      expect(getCachedRedirects).toHaveBeenNthCalledWith(2, true);
    }
  });

  it('continues request flow when redirect loading fails', async () => {
    const { handleRedirects } = await import('../../lib/server/redirect-handler');
    const resolve = vi.fn().mockResolvedValue(new Response('ok'));
    getCachedRedirects.mockRejectedValue(new Error('pb down'));

    const response = await handleRedirects({ event: event('/no-redirect'), resolve } as any);

    expect(response).toBeInstanceOf(Response);
    expect(resolve).toHaveBeenCalled();
    expect(loggerError).toHaveBeenCalled();
  });
});
