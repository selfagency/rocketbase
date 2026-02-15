import { describe, expect, it, vi } from 'vitest';

import { getRestoreSnapshot, getRevisionHistory } from '../../lib/server/revision-history';

describe('revision-history', () => {
  it('returns after snapshot for create and update events', () => {
    const snapshot = { title: 'Published' };

    expect(
      getRestoreSnapshot({
        id: 'a',
        eventType: 'create',
        timestamp: '',
        created: '',
        authorId: null,
        authorName: 'System',
        authorEmail: null,
        before: null,
        after: snapshot,
      })
    ).toBe(snapshot);

    expect(
      getRestoreSnapshot({
        id: 'b',
        eventType: 'update',
        timestamp: '',
        created: '',
        authorId: null,
        authorName: 'System',
        authorEmail: null,
        before: { title: 'Draft' },
        after: snapshot,
      })
    ).toBe(snapshot);
  });

  it('builds query filter and maps audit log entries', async () => {
    const getList = vi.fn().mockResolvedValue({
      items: [
        {
          id: '1',
          event_type: 'update',
          timestamp: '2026-02-15T00:00:00.000Z',
          created: '2026-02-15T00:00:01.000Z',
          user: 'user_fallback',
          before_changes: { title: 'Old' },
          after_changes: { title: 'New' },
          expand: {
            user: {
              id: 'user_1',
              name: 'Editor One',
              email: 'editor@example.com',
            },
          },
        },
        {
          id: '2',
          event_type: 'create',
          created: '2026-02-16T00:00:00.000Z',
          user: 'user_only_id',
          before_changes: null,
          after_changes: { title: 'Created' },
        },
        {
          id: '3',
          event_type: 'delete',
          created: '2026-02-16T00:00:00.000Z',
          user: null,
          before_changes: { title: 'Should be filtered' },
          after_changes: null,
        },
      ],
    });

    const pb = {
      collection: vi.fn(() => ({ getList })),
    };

    const items = await getRevisionHistory(pb as any, 'pages', 'slug-"with"-\\slash', 20);

    expect(pb.collection).toHaveBeenCalledWith('audit_logs');
    expect(getList).toHaveBeenCalledWith(
      1,
      20,
      expect.objectContaining({
        filter:
          'collection_name = "pages" && record_id = "slug-\\"with\\"-\\\\slash" && (event_type = "create" || event_type = "update")',
        sort: '-timestamp,-created',
      })
    );

    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      id: '1',
      eventType: 'update',
      authorId: 'user_1',
      authorName: 'Editor One',
      authorEmail: 'editor@example.com',
      before: { title: 'Old' },
      after: { title: 'New' },
    });

    expect(items[1]).toMatchObject({
      id: '2',
      eventType: 'create',
      authorId: 'user_only_id',
      authorName: 'Unknown user',
      authorEmail: null,
      before: null,
      after: { title: 'Created' },
    });
  });

  it('uses system author when user info is absent', async () => {
    const pb = {
      collection: () => ({
        getList: vi.fn().mockResolvedValue({
          items: [
            {
              id: '1',
              event_type: 'create',
              created: '2026-02-17T00:00:00.000Z',
              user: null,
              before_changes: null,
              after_changes: { title: 'System created' },
            },
          ],
        }),
      }),
    };

    const [entry] = await getRevisionHistory(pb as any, 'posts', 'record_1');

    expect(entry.authorId).toBeNull();
    expect(entry.authorName).toBe('System');
    expect(entry.authorEmail).toBeNull();
  });
});
