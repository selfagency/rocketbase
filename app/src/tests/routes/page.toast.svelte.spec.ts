import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

vi.mock('$app/state', () => ({
  page: {
    url: new URL('http://localhost:5173/?login=success&logout=success'),
    data: {},
  },
}));

vi.mock('$lib/stores/toast', () => ({
  toast: vi.fn(),
}));

import { toast } from '$lib/stores/toast';
import Page from '../../routes/+page.svelte';

describe('/+page.svelte toast behavior', () => {
  it('shows success toasts for login and logout query params', async () => {
    expect.assertions(2);

    render(Page, {
      props: {
        data: {
          navItems: [],
          user: null,
          page: null,
          url: 'http://localhost:5173',
          metadata: {},
        },
      },
    });

    await Promise.resolve();
    await Promise.resolve();

    expect(toast).toHaveBeenCalledWith(expect.any(String), 'success');
    expect(toast).toHaveBeenCalledTimes(2);
  });
});
