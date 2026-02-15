import { describe, expect, it } from 'vitest';

import {
  mapPageSnapshotToUpdate,
  mapPostSnapshotToUpdate,
  mapSnapshotToContentUpdate,
} from '../../../lib/server/mappers/content-mapper';

describe('content-mapper', () => {
  it('maps post snapshot fields to update payload', () => {
    const payload = mapPostSnapshotToUpdate({
      title: 'Post',
      slug: 'post',
      summary: 'sum',
      content: 'content',
      date: '2026-02-15T08:00:00Z',
      embed: '<iframe></iframe>',
      enclosure: 'https://example.com/audio.mp3',
      published: true,
      visible: true,
      require_login: false,
      subscriber_only: false,
      in_trash: false,
      author: [{ id: 'u1' }],
      tags: [{ id: 't1' }],
      attachments: ['m1'],
    } as any);

    expect(payload).toMatchObject({
      title: 'Post',
      slug: 'post',
      author: ['u1'],
      tags: ['t1'],
      attachments: ['m1'],
      embed: '<iframe></iframe>',
    });
    expect(typeof payload.date).toBe('string');
  });

  it('maps page snapshot fields to update payload', () => {
    const payload = mapPageSnapshotToUpdate({
      title: 'Page',
      slug: 'page',
      summary: 'sum',
      content: 'content',
      collection: 'posts',
      parent: 'p1',
      custom_css: '.x{}',
      order: 3.9,
      published: false,
      visible: true,
      require_login: true,
      subscriber_only: false,
      attachments: [{ id: 'm1' }],
    } as any);

    expect(payload).toMatchObject({
      title: 'Page',
      slug: 'page',
      collection: 'posts',
      parent: 'p1',
      custom_css: '.x{}',
      order: 3,
      attachments: ['m1'],
    });
  });

  it('supports generic mapper for both entities', () => {
    const postPayload = mapSnapshotToContentUpdate({ title: 'A', slug: 'a' } as any, 'post');
    const pagePayload = mapSnapshotToContentUpdate({ title: 'B', slug: 'b' } as any, 'page');

    expect(postPayload).toMatchObject({ title: 'A', slug: 'a' });
    expect(pagePayload).toMatchObject({ title: 'B', slug: 'b' });
  });
});
