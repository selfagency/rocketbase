import { describe, expect, it, vi } from 'vitest';

import { load } from '../../../../routes/authors/[id]/+page.server';

describe('author detail +page.server', () => {
  it('loads author and posts with pagination', async () => {
    const getOne = vi.fn().mockResolvedValue({ id: 'u1', name: 'Ada' });
    const getList = vi.fn().mockResolvedValue({
      items: [{ id: 'post1', title: 'Hello', slug: 'hello' }],
      totalItems: 1,
      totalPages: 1,
    });

    const pb = {
      collection: vi.fn((name: string) => {
        if (name === 'users') return { getOne };
        return { getList };
      }),
    } as any;

    const result: any = await load({
      locals: { pb },
      params: { id: 'u1' },
      url: new URL('http://localhost/authors/u1?page=1&perPage=5'),
    } as any);

    expect(result.author).toEqual({ id: 'u1', name: 'Ada' });
    expect(result.posts).toHaveLength(1);
    expect(result.pagination).toEqual({ page: 1, perPage: 5, totalItems: 1, totalPages: 1 });
  });

  it('throws 404 when author is missing', async () => {
    const err: any = new Error('not found');
    err.status = 404;

    const pb = {
      collection: vi.fn((name: string) => {
        if (name === 'users') return { getOne: vi.fn().mockRejectedValue(err) };
        return { getList: vi.fn() };
      }),
    } as any;

    await expect(
      load({
        locals: { pb },
        params: { id: 'missing' },
        url: new URL('http://localhost/authors/missing'),
      } as any)
    ).rejects.toMatchObject({ status: 404 });
  });
});
