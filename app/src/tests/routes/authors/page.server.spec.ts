import { describe, expect, it, vi } from 'vitest';

import { load } from '../../../routes/authors/+page.server';

describe('authors index +page.server', () => {
  it('returns authors with published/visible post counts', async () => {
    const users = [
      { id: 'u1', name: 'Ada', email: 'ada@example.com' },
      { id: 'u2', name: 'Grace', email: 'grace@example.com' },
    ];

    const pb = {
      collection: vi
        .fn()
        .mockReturnValueOnce({ getFullList: vi.fn().mockResolvedValue(users) })
        .mockReturnValue({
          getList: vi.fn().mockResolvedValueOnce({ totalItems: 1 }).mockResolvedValueOnce({ totalItems: 0 }),
        }),
      authStore: { record: { id: 'u1' } },
    } as any;

    const result: any = await load({
      locals: {
        pb,
        logger: { withContext: vi.fn().mockReturnThis(), error: vi.fn() },
        requestId: 'req-1',
      },
    } as any);

    expect(result.authors).toHaveLength(1);
    expect(result.authors[0].id).toBe('u1');
  });

  it('returns empty list on error', async () => {
    const logger = { withContext: vi.fn().mockReturnThis(), error: vi.fn() };

    const result: any = await load({
      locals: {
        pb: {
          collection: vi.fn(() => ({ getFullList: vi.fn().mockRejectedValue(new Error('db down')) })),
          authStore: { record: { id: 'u1' } },
        },
        logger,
        requestId: 'req-1',
      },
    } as any);

    expect(result.authors).toEqual([]);
    expect(logger.error).toHaveBeenCalledWith('Error loading authors');
  });
});
