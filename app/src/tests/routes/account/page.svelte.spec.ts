import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import AccountPage from '../../../routes/account/+page.svelte';

type PageData = {
  navItems: any[];
  profileForm: any;
  passwordForm: any;
  mfaForm: any;
  mfaRequired: boolean;
  mfaOptIn: boolean;
  mfaEnabled: boolean;
  user: any;
  url: string;
  metadata: Record<string, string>;
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
    mfaForm: {
      valid: true,
      posted: false,
      errors: {},
      data: {
        mfaOptIn: false,
      },
      constraints: {},
      message: undefined,
      id: 'mfaForm',
    },
    mfaRequired: false,
    mfaOptIn: false,
    mfaEnabled: false,
    user: mockUser,
    url: 'http://localhost:5173',
    metadata: {},
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

  it('renders MFA required alert state', async () => {
    expect.assertions(1);
    const { container } = await render(AccountPage, {
      props: {
        data: {
          ...mockFormData,
          mfaRequired: true,
        },
      },
    });

    expect(container.textContent).toContain('2FA Required');
  });

  it('auto-submits MFA form when opt-in is toggled', async () => {
    expect.assertions(2);
    const requestSubmitSpy = vi.spyOn(HTMLFormElement.prototype, 'requestSubmit').mockImplementation(() => undefined);

    const { container } = await render(AccountPage, { props: { data: mockFormData } });
    const switchInput = container.querySelector('#mfa-opt-in') as HTMLInputElement | null;

    expect(switchInput).not.toBeNull();
    switchInput?.click();

    await Promise.resolve();
    await Promise.resolve();

    expect(requestSubmitSpy).toHaveBeenCalled();

    requestSubmitSpy.mockRestore();
  });

  it('renders password form error message when present', async () => {
    expect.assertions(1);
    const { container } = await render(AccountPage, {
      props: {
        data: {
          ...mockFormData,
          passwordForm: {
            ...mockFormData.passwordForm,
            message: 'Current password is incorrect',
          },
        },
      },
    });

    expect(container.textContent).toContain('Current password is incorrect');
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
