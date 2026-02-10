import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import AccountPage from '../../../routes/account/+page.svelte';

type PageData = {
  navItems: any[];
  profileForm: any;
  passwordForm: any;
  mfaRequired: boolean;
  mfaOptIn: boolean;
  mfaEnabled: boolean;
  user: any;
};

describe('Account Page Component', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    title: 'Developer',
    bio: 'Test bio',
    website: 'https://example.com',
    avatar: '',
    verified: false,
    role: 'user',
  };

  const mockFormData: PageData = {
    navItems: [],
    profileForm: {
      valid: true,
      posted: false,
      errors: {},
      data: {
        name: 'Test User',
        email: 'test@example.com',
        title: 'Developer',
        bio: 'Test bio',
        website: 'https://example.com',
        avatar: undefined,
      },
      constraints: {},
      message: undefined,
      id: 'profileForm',
    },
    passwordForm: {
      valid: true,
      posted: false,
      errors: {},
      data: {
        oldPassword: '',
        password: '',
        passwordConfirm: '',
      },
      constraints: {},
      message: undefined,
      id: 'passwordForm',
    },
    mfaRequired: false,
    mfaOptIn: false,
    mfaEnabled: false,
    user: mockUser,
  };

  it('renders account page without errors', async () => {
    expect.assertions(1);
    const { container } = await render(AccountPage, { props: { data: mockFormData } });
    expect(container).toBeTruthy();
  });

  it('renders with MFA enabled', async () => {
    expect.assertions(1);
    const dataWithMFA: PageData = {
      ...mockFormData,
      mfaOptIn: true,
      mfaEnabled: true,
    };
    const { container } = await render(AccountPage, { props: { data: dataWithMFA } });
    expect(container).toBeTruthy();
  });

  it('renders with validation errors', async () => {
    expect.assertions(1);
    const dataWithErrors: PageData = {
      ...mockFormData,
      profileForm: {
        ...mockFormData.profileForm,
        valid: false,
        errors: {
          name: ['Name must be at least 2 characters'],
          email: ['Invalid email address'],
        },
      },
    };
    const { container } = await render(AccountPage, { props: { data: dataWithErrors } });
    expect(container).toBeTruthy();
  });
});
