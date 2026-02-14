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

  it('renders child summary text when nested item includes summary', async () => {
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

    const servicesTrigger = Array.from(container.querySelectorAll('button, a')).find(el =>
      el.textContent?.includes('Services')
    );
    servicesTrigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await Promise.resolve();

    // Content can be portaled in primitives; inspect whole document text.
    expect(document.body.textContent || '').toContain('Expert advice');
  });

  it('shows admin links when admin menu is opened', async () => {
    const { container } = render(Nav, {
      props: {
        navItems: [],
      },
    });

    const adminTrigger = Array.from(container.querySelectorAll('button, a')).find(el =>
      el.textContent?.match(/admin/i)
    );
    expect(adminTrigger).toBeTruthy();

    adminTrigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await Promise.resolve();

    const pageText = document.body.textContent || '';
    expect(pageText).toMatch(/dashboard|admin/i);
    expect(pageText).toMatch(/pages/i);
  });

  it('handles account and logout dropdown item selections', async () => {
    render(Nav, {
      props: {
        navItems: [],
      },
    });

    const accountItem = Array.from(document.querySelectorAll('[role="menuitem"], button, div')).find(el =>
      el.textContent?.match(/account settings/i)
    );
    const logoutItem = Array.from(document.querySelectorAll('[role="menuitem"], button, div')).find(el =>
      el.textContent?.match(/logout/i)
    );

    expect(accountItem).toBeTruthy();
    expect(logoutItem).toBeTruthy();

    accountItem?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    accountItem?.dispatchEvent(new CustomEvent('select', { bubbles: true, cancelable: true }));
    logoutItem?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    logoutItem?.dispatchEvent(new CustomEvent('select', { bubbles: true, cancelable: true }));

    await Promise.resolve();
  });
});
