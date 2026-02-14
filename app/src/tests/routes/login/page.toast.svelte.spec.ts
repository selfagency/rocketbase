import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

vi.mock('$app/state', () => ({
  page: {
    url: new URL('http://localhost:5173/login?registered=true'),
    data: {},
  },
}));

vi.mock('$lib/stores/toast', () => ({
  toast: vi.fn(),
}));

import { toast } from '$lib/stores/toast';
import LoginPage from '../../../routes/login/+page.svelte';

describe('/login/+page.svelte toast behavior', () => {
  it('shows registration success toast when registered=true', async () => {
    expect.assertions(2);

    render(LoginPage, {
      props: {
        data: {
          navItems: [],
          user: null,
          form: {
            valid: true,
            posted: false,
            errors: {},
            data: { email: '', password: '' },
            constraints: {},
            message: undefined,
            id: 'test-form',
          },
          url: 'http://localhost:5173/login',
          metadata: {},
        },
      },
    });

    await Promise.resolve();
    await Promise.resolve();

    expect(toast).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith(expect.any(String), 'success');
  });
});
