import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import AccountPage from '../../../routes/account/+page.svelte';

describe('ProfileCard rendering via Account Page', () => {
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

  const createMockData = (userOverrides = {}) => ({
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
    user: { ...mockUser, ...userOverrides },
    url: 'http://localhost:5173',
    metadata: {},
  });

  it('renders ProfileCard with user role badge', async () => {
    const { container } = render(AccountPage, { props: { data: createMockData() as any } });
    expect(container.textContent).toContain('user');
  });

  it('renders ProfileCard with admin role badge', async () => {
    const { container } = render(AccountPage, { props: { data: createMockData({ role: 'admin' }) as any } });
    expect(container.textContent).toContain('admin');
  });

  it('shows verified badge for verified users', async () => {
    const { container } = render(AccountPage, { props: { data: createMockData({ verified: true }) as any } });
    expect(container.textContent).toContain('Verified');
  });

  it('shows verification email button for unverified users', async () => {
    const { container } = render(AccountPage, { props: { data: createMockData({ verified: false }) as any } });
    const sendButton = container.querySelector('[data-testid="send-verification-email-button"]');
    expect(sendButton).not.toBeNull();
  });

  it('does not show verification email button for verified users', async () => {
    const { container } = render(AccountPage, { props: { data: createMockData({ verified: true }) as any } });
    const sendButton = container.querySelector('[data-testid="send-verification-email-button"]');
    expect(sendButton).toBeNull();
  });

  it('renders avatar remove button when user has avatar', async () => {
    const { container } = render(AccountPage, { props: { data: createMockData({ avatar: 'avatar.jpg' }) as any } });
    expect(container.textContent).toContain('Remove');
  });

  it('does not render avatar remove button when user has no avatar', async () => {
    const { container } = render(AccountPage, { props: { data: createMockData({ avatar: '' }) as any } });
    const buttons = container.querySelectorAll('button');
    const removeButton = Array.from(buttons).find(btn => btn.textContent?.includes('Remove Avatar'));
    expect(removeButton).toBeUndefined();
  });
});
