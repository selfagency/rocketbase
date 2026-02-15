import { describe, expect, it, vi } from 'vitest';

import { POST } from '../../../../../routes/admin/pages/reorder/+server';

describe('admin pages reorder +server', () => {
  function createLocals(role: string = 'editor') {
    const update = vi.fn().mockResolvedValue({});

    return {
      pb: {
        collection: vi.fn(() => ({ update })),
      },
      user: role ? { id: 'u1', role } : null,
      _mocks: { update },
    } as any;
  }

  it('rejects unauthenticated/forbidden requests', async () => {
    const unauth = await POST({
      locals: createLocals('') as any,
      request: new Request('http://localhost', { method: 'POST', body: JSON.stringify({ order: [] }) }),
    } as any);
    expect(unauth.status).toBe(401);

    const forbidden = await POST({
      locals: createLocals('user') as any,
      request: new Request('http://localhost', { method: 'POST', body: JSON.stringify({ order: [] }) }),
    } as any);
    expect(forbidden.status).toBe(403);
  });

  it('updates order values sequentially', async () => {
    const locals = createLocals();
    const response = await POST({
      locals,
      request: new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ order: ['p3', 'p2', 'p1'] }),
      }),
    } as any);

    expect(response.status).toBe(200);
    expect(locals._mocks.update).toHaveBeenCalledWith('p3', { order: 1 });
    expect(locals._mocks.update).toHaveBeenCalledWith('p2', { order: 2 });
    expect(locals._mocks.update).toHaveBeenCalledWith('p1', { order: 3 });
  });
});
