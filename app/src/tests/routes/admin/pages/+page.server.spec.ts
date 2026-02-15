import { describe, expect, it, vi } from 'vitest';

import { actions, load } from '../../../../routes/admin/pages/+page.server';

describe('admin pages index +page.server', () => {
  function createLocals() {
    const update = vi.fn();
    const getList = vi.fn().mockResolvedValue({
      items: [
        { id: 'p1', title: 'A', slug: 'a', parent: '', order: 1, published: true, visible: true, in_trash: false },
      ],
    });

    return {
      pb: {
        collection: vi.fn(() => ({ getList, update })),
      },
      user: { id: 'u1', role: 'editor' },
      _mocks: { getList, update },
    } as any;
  }

  it('rejects unauthenticated requests', async () => {
    const locals = createLocals();
    locals.user = null;

    await expect(load({ locals, url: new URL('http://localhost/admin/pages') } as any)).rejects.toMatchObject({
      status: 401,
    });
  });

  it('loads pages with status/search filters', async () => {
    const locals = createLocals();
    const url = new URL('http://localhost/admin/pages?status=trash&search=home');

    const result: any = await load({ locals, url } as any);

    expect(result.pages).toHaveLength(1);
    expect(locals._mocks.getList).toHaveBeenCalledWith(
      1,
      500,
      expect.objectContaining({
        filter: expect.stringContaining('in_trash = true'),
      })
    );
  });

  it('delete action validates id and soft-deletes', async () => {
    const locals = createLocals();

    const missing = await actions.delete({
      locals,
      request: new Request('http://localhost', { method: 'POST', body: new FormData() }),
    } as any);
    expect((missing as any).status).toBe(400);

    const formData = new FormData();
    formData.append('id', 'p1');
    const success: any = await actions.delete({
      locals,
      request: new Request('http://localhost', { method: 'POST', body: formData }),
    } as any);

    expect(success.success).toBe(true);
    expect(locals._mocks.update).toHaveBeenCalledWith('p1', expect.objectContaining({ in_trash: true }));
  });

  it('undelete action restores trashed page', async () => {
    const locals = createLocals();
    const formData = new FormData();
    formData.append('id', 'p1');

    const success: any = await actions.undelete({
      locals,
      request: new Request('http://localhost', { method: 'POST', body: formData }),
    } as any);

    expect(success.success).toBe(true);
    expect(locals._mocks.update).toHaveBeenCalledWith('p1', expect.objectContaining({ in_trash: false }));
  });
});
