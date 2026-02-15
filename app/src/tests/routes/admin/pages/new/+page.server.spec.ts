import { describe, expect, it, vi } from 'vitest';

import { actions, load } from '../../../../../routes/admin/pages/new/+page.server';

describe('admin pages new +page.server', () => {
  function createLocals() {
    const getFullList = vi.fn().mockResolvedValue([{ id: 'parent1', title: 'Parent', slug: 'parent', parent: '' }]);
    const create = vi.fn().mockResolvedValue({ id: 'new-page-id' });

    return {
      pb: {
        collection: vi.fn((name: string) => {
          if (name === 'pages') return { getFullList, create };
          if (name === 'media') return { create: vi.fn().mockResolvedValue({ id: 'm1' }) };
          return { getFullList, create };
        }),
      },
      user: { id: 'u1', role: 'editor' },
      _mocks: { getFullList, create },
    } as any;
  }

  it('loads form and available parents', async () => {
    const locals = createLocals();

    const result: any = await load({ locals } as any);

    expect(result.availableParents).toEqual([{ id: 'parent1', title: 'Parent', slug: 'parent', parent: '' }]);
    expect(result.form).toBeTruthy();
  });

  it('returns failure payload after create attempt (current route behavior)', async () => {
    const locals = createLocals();
    const formData = new FormData();
    formData.append('title', 'Page title');
    formData.append('slug', 'page-title');
    formData.append('published', 'false');
    formData.append('visible', 'true');
    formData.append('require_login', 'false');
    formData.append('subscriber_only', 'false');

    const result: any = await actions.default({
      locals,
      request: new Request('http://localhost', { method: 'POST', body: formData }),
    } as any);

    expect(result.status).toBe(500);
    expect(locals._mocks.create).toHaveBeenCalled();
  });
});
