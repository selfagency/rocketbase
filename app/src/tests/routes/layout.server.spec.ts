import { describe, expect, it, vi } from 'vitest';

import { load } from '../../routes/+layout.server';

describe('root +layout.server', () => {
  it('loads nav hierarchy, metadata and user', async () => {
    const getFullListPages = vi.fn().mockResolvedValue([
      { id: 'home', title: 'Home', slug: '', order: 1, parent: '' },
      { id: 'about', title: 'About', slug: 'about', order: 2, parent: '' },
    ]);
    const getFullListMetadata = vi.fn().mockResolvedValue([{ key: 'site_title', value: 'Rocketbase', type: 'text' }]);

    const pb = {
      collection: vi.fn((name: string) => {
        if (name === 'pages') return { getFullList: getFullListPages };
        return { getFullList: getFullListMetadata };
      }),
    } as any;

    const result: any = await load({
      locals: {
        pb,
        user: { id: 'u1', role: 'editor' },
      },
      url: new URL('http://localhost/'),
    } as any);

    expect(result.navItems).toHaveLength(2);
    expect(result.metadata.site_title).toBe('Rocketbase');
    expect(result.user).toEqual({ id: 'u1', role: 'editor' });
    expect(result.url).toBe('http://localhost');
  });
});
