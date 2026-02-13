import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import RegisterPage from '../../../routes/register/+page.svelte';

type PageData = { navItems: any[]; user: any; form: any };

describe('Register Page Component', () => {
  const mockFormData: PageData = {
    navItems: [],
    form: {
      valid: true,
      posted: false,
      errors: {},
      data: { email: '', password: '', passwordConfirm: '', name: '' },
      constraints: {},
      message: undefined,
      id: 'test-form',
    },
  };

  it('renders registration form without errors', async () => {
    expect.assertions(1);
    const { container } = render(RegisterPage, { props: { data: mockFormData } });
    expect(container).toBeTruthy();
  });

  it('renders with validation errors', async () => {
    expect.assertions(1);
    const dataWithErrors: PageData = {
      navItems: [],
      form: {
        ...mockFormData.form,
        valid: false,
        errors: {
          name: ['Name must be at least 2 characters'],
          email: ['Invalid email address'],
        },
      },
    };
    const { container } = render(RegisterPage, { props: { data: dataWithErrors } });
    expect(container).toBeTruthy();
  });
});
