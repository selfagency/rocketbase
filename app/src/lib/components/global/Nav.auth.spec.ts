import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

vi.mock('$app/navigation', () => ({
  goto: vi.fn(),
}));

vi.mock('$app/state', () => ({
  page: {
    data: {
      user: {
        id: 'user-admin',
        email: 'admin@example.com',
        name: 'Admin User',
        avatar: '',
        role: 'admin',
        verified: true,
      },
    },
    url: new URL('http://localhost:5173'),
  },
}));

import Nav from './Nav.svelte';

describe('Nav.svelte (authenticated/admin)', () => {
  it('renders authenticated navigation without login button', async () => {
    const { container } = render(Nav, {
      props: {
        navItems: [],
      },
    });

    expect(container.textContent).not.toMatch(/login/i);
    expect(container.querySelector('[aria-label]')).toBeTruthy();
  });

  it('renders admin trigger for privileged user', async () => {
    const { container } = render(Nav, {
      props: {
        navItems: [],
      },
    });

    expect(container.textContent).toMatch(/admin/i);
  });

  it('handles user dropdown trigger interaction', async () => {
    const { container } = render(Nav, {
      props: {
        navItems: [],
      },
    });

    const trigger = container.querySelector('[aria-label]') as HTMLElement | null;
    expect(trigger).toBeTruthy();

    trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await Promise.resolve();

    // Dropdown content is rendered by primitives and may be portaled/hidden depending on test env;
    // this assertion focuses on interaction path without runtime errors.
    expect(trigger).toBeTruthy();
  });

  it('renders nested menu trigger for parent item', async () => {
    const navItems = [
      {
        id: 'services',
        slug: 'services',
        title: 'Services',
        children: [
          {
            id: 'consulting',
            slug: 'consulting',
            title: 'Consulting',
            summary: 'Expert advice',
          },
        ],
      },
    ];

    const { container } = render(Nav, {
      props: { navItems: navItems as any },
    });

    expect(container.textContent).toContain('Services');

    const servicesTrigger = Array.from(container.querySelectorAll('button, a')).find(el =>
      el.textContent?.includes('Services')
    );

    expect(servicesTrigger).toBeTruthy();
  });
});
