import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../../../lib/server/repositories/media-repository', () => ({
  buildMediaSearchFilter: vi.fn(() => ''),
  listAttachedMedia: vi.fn().mockResolvedValue([{ id: 'm1', url: 'x' }]),
  mapMediaItem: vi.fn((_pb, record) => ({ id: record.id ?? 'm1' })),
  parseAttachmentIds: vi.fn(() => ['m1']),
  resolveAttachedIds: vi.fn().mockResolvedValue(['m1']),
}));

vi.mock('../../../../../lib/server/services/pexels-service', () => ({
  downloadPexelsImage: vi.fn(),
  importPexelsMedia: vi.fn(),
}));

import { DELETE, GET, PATCH, POST } from '../../../../../routes/api/admin/media/+server';

describe('api admin media +server', () => {
  function locals() {
    const collection = vi.fn(() => ({
      getList: vi.fn().mockResolvedValue({ page: 1, perPage: 24, totalItems: 0, totalPages: 0, items: [] }),
      create: vi.fn().mockResolvedValue({ id: 'm1' }),
      update: vi.fn().mockResolvedValue({ id: 'm1' }),
      delete: vi.fn().mockResolvedValue({}),
    }));

    return {
      user: { id: 'u1', role: 'editor' },
      pb: { collection },
      _collection: collection,
    } as any;
  }

  it('returns attached items when scope=attached', async () => {
    const event = {
      locals: locals(),
      request: new Request('http://localhost/api/admin/media?scope=attached&entityType=post&entityId=p1'),
    } as any;

    const response = await GET(event);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.items).toEqual([{ id: 'm1', url: 'x' }]);
  });

  it('validates upload payload in POST', async () => {
    const event = {
      locals: locals(),
      request: new Request('http://localhost/api/admin/media', { method: 'POST', body: new FormData() }),
    } as any;

    const response = await POST(event);
    expect(response.status).toBe(400);
  });

  it('updates media metadata via PATCH', async () => {
    const event = {
      locals: locals(),
      request: new Request('http://localhost/api/admin/media', {
        method: 'PATCH',
        body: JSON.stringify({ id: 'm1', altText: 'Alt', caption: 'Cap' }),
      }),
    } as any;

    const response = await PATCH(event);
    expect(response.status).toBe(200);
  });

  it('validates delete id', async () => {
    const missing = await DELETE({
      locals: locals(),
      request: new Request('http://localhost/api/admin/media', { method: 'DELETE' }),
    } as any);
    expect(missing.status).toBe(400);
  });
});
