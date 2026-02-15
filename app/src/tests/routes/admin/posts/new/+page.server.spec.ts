import { describe, expect, it, vi } from 'vitest';

import { actions, load } from '../../../../../routes/admin/posts/new/+page.server';

describe('admin posts new +page.server', () => {
  function createLocals() {
    const getFullListUsers = vi.fn().mockResolvedValue([{ id: 'u1', name: 'Ada', email: 'ada@example.com' }]);
    const getFullListTags = vi.fn().mockResolvedValue([{ id: 't1', tag: 'svelte', slug: 'svelte' }]);
    const createPost = vi.fn().mockResolvedValue({ id: 'post-new' });

    return {
      pb: {
        collection: vi.fn((name: string) => {
          if (name === 'users') return { getFullList: getFullListUsers };
          if (name === 'tags') return { getFullList: getFullListTags };
          if (name === 'posts') return { create: createPost };
          if (name === 'media') return { create: vi.fn().mockResolvedValue({ id: 'm1' }) };
          return { getFullList: vi.fn(), create: vi.fn() };
        }),
      },
      user: { id: 'u1', role: 'editor' },
      _mocks: { createPost },
    } as any;
  }

  it('loads authors/tags and form defaults', async () => {
    const locals = createLocals();

    const result: any = await load({ locals } as any);

    expect(result.authors).toEqual([{ id: 'u1', name: 'Ada' }]);
    expect(result.tags).toEqual([{ id: 't1', name: 'svelte' }]);
    expect(result.form?.data?.author).toEqual(['u1']);
  });

  it('creates post and redirects to edit page', async () => {
    const locals = createLocals();
    const formData = new FormData();
    formData.append('title', 'Post title');
    formData.append('slug', 'post-title');
    formData.append('date', '2026-02-15T08:00');
    formData.append('author', 'u1');
    formData.append('published', 'false');
    formData.append('visible', 'true');
    formData.append('require_login', 'false');
    formData.append('subscriber_only', 'false');

    await expect(
      actions.default({
        locals,
        request: new Request('http://localhost', { method: 'POST', body: formData }),
      } as any)
    ).rejects.toMatchObject({ status: 303, location: '/admin/posts/post-new' });
  });
});
