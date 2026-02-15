import { describe, expect, it, vi } from 'vitest';

import {
  buildMediaSearchFilter,
  escapeFilterValue,
  listAttachedMedia,
  mapMediaItem,
  parseAttachmentIds,
  resolveAttachedIds,
} from '../../../lib/server/repositories/media-repository';

describe('media-repository', () => {
  it('parses attachment ids from comma separated input', () => {
    expect(parseAttachmentIds('a, b,,c')).toEqual(['a', 'b', 'c']);
    expect(parseAttachmentIds(null)).toEqual([]);
  });

  it('escapes filter values and builds media search filter', () => {
    expect(escapeFilterValue('x"y\\z')).toBe('x\\"y\\\\z');
    expect(buildMediaSearchFilter('photo')).toContain('alt_text~"photo"');
    expect(buildMediaSearchFilter('')).toBe('');
  });

  it('maps media records with attribution metadata', () => {
    const pb = {
      files: {
        getURL: vi.fn(() => 'https://cdn/file.jpg'),
      },
    };

    const mapped = mapMediaItem(pb as any, {
      id: 'm1',
      file: 'file.jpg',
      alt_text: 'Alt',
      caption: 'Cap',
      source: 'pexels',
      source_url: 'https://pexels.com/photo/1',
      created: 'now',
      updated: 'now',
      metadata: JSON.stringify({
        photographer: 'Ada',
        photographerUrl: 'https://pexels.com/@ada',
        photoUrl: 'https://pexels.com/photo/1',
      }),
    });

    expect(mapped).toMatchObject({
      id: 'm1',
      url: 'https://cdn/file.jpg',
      source: 'pexels',
      attribution: {
        photographer: 'Ada',
      },
    });
  });

  it('resolves attached ids by combining posted and existing entity attachments', async () => {
    const getOne = vi.fn().mockResolvedValue({ attachments: ['m2', 'm3'] });
    const pb = {
      collection: vi.fn(() => ({ getOne })),
    };

    const ids = await resolveAttachedIds(pb as any, 'post', 'post_1', ['m1', 'm2']);

    expect(ids).toEqual(['m1', 'm2', 'm3']);
    expect(pb.collection).toHaveBeenCalledWith('posts');
  });

  it('lists attached media and skips missing records', async () => {
    const getOne = vi
      .fn()
      .mockResolvedValueOnce({ id: 'm1', file: 'a.jpg', created: '', updated: '', metadata: '{}' })
      .mockRejectedValueOnce(new Error('missing'));

    const pb = {
      collection: vi.fn(() => ({ getOne })),
      files: {
        getURL: vi.fn((record: any) => `https://cdn/${record.file}`),
      },
    };

    const list = await listAttachedMedia(pb as any, ['m1', 'm2']);

    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('m1');
  });
});
