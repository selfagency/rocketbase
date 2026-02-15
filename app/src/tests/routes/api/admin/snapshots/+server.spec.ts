import { describe, expect, it, vi } from 'vitest';

import { DELETE, GET, POST } from '../../../../../routes/api/admin/snapshots/+server';

describe('api admin snapshots +server', () => {
  function createLocals() {
    const snapshots = {
      getFirstListItem: vi.fn().mockRejectedValue(new Error('not found')),
      getFullList: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ id: 's1', updated: '2026-02-15T00:00:00.000Z' }),
      update: vi.fn().mockResolvedValue({ id: 's1', updated: '2026-02-15T00:00:00.000Z' }),
      delete: vi.fn().mockResolvedValue({}),
    };
    const posts = { getOne: vi.fn().mockResolvedValue({ updated: '2026-02-15T00:00:00.000Z' }) };

    const collection = vi.fn((name: string) => {
      if (name === 'snapshots') return snapshots;
      if (name === 'posts' || name === 'pages') return posts;
      return snapshots;
    });

    return {
      user: { id: 'u1', role: 'editor' },
      pb: { collection },
      _mocks: { snapshots, posts },
    } as any;
  }

  it('validates required GET query params', async () => {
    const response = await GET({
      locals: createLocals(),
      url: new URL('http://localhost/api/admin/snapshots'),
    } as any);

    expect(response.status).toBe(400);
  });

  it('returns snapshot status for valid GET', async () => {
    const response = await GET({
      locals: createLocals(),
      url: new URL('http://localhost/api/admin/snapshots?collectionId=posts&recordId=abc'),
    } as any);

    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload).toHaveProperty('activeEditors');
  });

  it('upserts snapshot on POST', async () => {
    const response = await POST({
      locals: createLocals(),
      request: new Request('http://localhost/api/admin/snapshots', {
        method: 'POST',
        body: JSON.stringify({ action: 'autosave', collectionId: 'posts', recordId: 'abc', snapshot: { x: 1 } }),
      }),
    } as any);

    expect(response.status).toBe(200);
  });

  it('returns success for DELETE even if snapshot is missing', async () => {
    const response = await DELETE({
      locals: createLocals(),
      url: new URL('http://localhost/api/admin/snapshots?collectionId=posts&recordId=abc'),
    } as any);

    expect(response.status).toBe(200);
  });
});
