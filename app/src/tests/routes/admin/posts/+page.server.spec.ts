import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../../lib/server/page-size-store', () => ({
  getServerPageSizes: vi.fn().mockResolvedValue({ adminPostsPerPage: 10, postsPerPage: 10, loadedAt: Date.now() }),
}));

import { actions, load } from '../../../../routes/admin/posts/+page.server';

describe('admin posts index +page.server', () => {
  function createLocals() {
    const getList = vi.fn().mockResolvedValue({
      items: [{ id: 'post1', author: ['u1'], tags: [], expand: { author: [{ id: 'u1', name: 'Ada' }], tags: [] } }],
      totalPages: 1,
      page: 1,
      perPage: 10,
      totalItems: 1,
    });
    const getFullList = vi.fn().mockResolvedValue([{ id: 'u1', name: 'Ada', email: 'ada@example.com' }]);
    const update = vi.fn().mockResolvedValue({});

    return {
      pb: {
        collection: vi.fn((name: string) => {
          if (name === 'posts') return { getList, update };
          if (name === 'users') return { getFullList };
          return { getList, getFullList, update };
        }),
      },
      user: { id: 'u1', role: 'editor' },
      _mocks: { getList, getFullList, update },
    } as any;
  }

  it('loads posts with authors list', async () => {
    const locals = createLocals();
    const result: any = await load({ locals, url: new URL('http://localhost/admin/posts') } as any);

    expect(result.posts).toHaveLength(1);
    expect(result.authors).toEqual([{ id: 'u1', name: 'Ada' }]);
  });

  it('delete and undelete actions update in_trash', async () => {
    const locals = createLocals();

    const deleteData = new FormData();
    deleteData.append('id', 'post1');
    const delResult: any = await actions.delete({
      locals,
      request: new Request('http://localhost', { method: 'POST', body: deleteData }),
    } as any);
    expect(delResult.success).toBe(true);
    expect(locals._mocks.update).toHaveBeenCalledWith('post1', expect.objectContaining({ in_trash: true }));

    const undeleteData = new FormData();
    undeleteData.append('id', 'post1');
    const undelResult: any = await actions.undelete({
      locals,
      request: new Request('http://localhost', { method: 'POST', body: undeleteData }),
    } as any);
    expect(undelResult.success).toBe(true);
    expect(locals._mocks.update).toHaveBeenCalledWith('post1', expect.objectContaining({ in_trash: false }));
  });
});
