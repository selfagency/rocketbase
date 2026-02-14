import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

vi.mock('$app/navigation', () => ({
  goto: vi.fn(),
}));

vi.mock('$app/state', () => ({
  page: {
    data: {
      user: {
        id: 'user-contributor',
        email: 'contrib@example.com',
        name: 'Contributor User',
        avatar: '',
        role: 'contributor',
        verified: true,
      },
    },
    url: new URL('http://localhost:5173'),
  },
}));

import Nav from './Nav.svelte';

describe('Nav.svelte (role-specific admin navigation)', () => {
  it('shows admin trigger but does not show pages link for contributor role', async () => {
    const { container } = render(Nav, {
      props: { navItems: [] as any[] },
    });

    const adminTrigger = Array.from(container.querySelectorAll('button, a')).find(el =>
      el.textContent?.match(/admin/i)
    );
    expect(adminTrigger).toBeTruthy();

    adminTrigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await Promise.resolve();

    const text = document.body.textContent || '';
    expect(text).toMatch(/dashboard|admin/i);
    expect(text).not.toMatch(/pages/i);
  });
});
