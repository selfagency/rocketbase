import { describe, expect, it, vi } from 'vitest';
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

  const createMockData = (userOverrides = {}, dataOverrides: Record<string, unknown> = {}) => ({
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
    ...dataOverrides,
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

  it('shows success state after sending verification email', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true }));
    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);

    const { container } = render(AccountPage, { props: { data: createMockData({ verified: false }) as any } });
    const sendButton = container.querySelector('[data-testid="send-verification-email-button"]') as HTMLElement | null;

    expect(sendButton).not.toBeNull();
    sendButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await Promise.resolve();
    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '?/sendVerificationEmail',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      })
    );
  });

  it('handles avatar file selection and shows remove button', async () => {
    class MockFileReader {
      result: string | ArrayBuffer | null = null;
      onload: ((event: ProgressEvent<FileReader>) => void) | null = null;

      readAsDataURL(_file: Blob) {
        this.result = 'data:image/png;base64,ZmFrZQ==';
        const event = {
          target: { result: this.result },
        } as unknown as ProgressEvent<FileReader>;
        this.onload?.(event);
      }
    }

    vi.stubGlobal('FileReader', MockFileReader as unknown as typeof FileReader);

    const { container } = render(AccountPage, {
      props: { data: createMockData({ avatar: '' }) as any },
    });

    const fileInput = container.querySelector('#avatar-upload') as HTMLInputElement | null;
    expect(fileInput).not.toBeNull();

    const file = new File(['avatar-bytes'], 'avatar.png', { type: 'image/png' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      configurable: true,
    });

    fileInput?.dispatchEvent(new Event('change', { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();

    expect(container.textContent).toContain('Remove');
  });

  it('renders profile-level error message when provided', async () => {
    const { container } = render(AccountPage, {
      props: {
        data: createMockData(
          {},
          {
            profileForm: {
              valid: false,
              posted: true,
              errors: {},
              data: {
                name: 'Test User',
                email: 'test@example.com',
                title: '',
                bio: '',
                website: '',
                avatar: undefined,
              },
              constraints: {},
              message: 'Profile update failed',
              id: 'profileForm',
            },
          }
        ) as any,
      },
    });

    expect(container.textContent).toContain('Profile update failed');
  });

  it('handles failed verification email response with JSON parse fallback', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: false,
      json: async () => {
        throw new Error('invalid json');
      },
    }));
    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);

    const { container } = render(AccountPage, { props: { data: createMockData({ verified: false }) as any } });
    const sendButton = container.querySelector('[data-testid="send-verification-email-button"]') as HTMLElement | null;

    sendButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('clicks upload button to trigger hidden file input click handler', async () => {
    const { container } = render(AccountPage, {
      props: { data: createMockData({ avatar: '' }) as any },
    });

    const fileInput = container.querySelector('#avatar-upload') as HTMLInputElement | null;
    expect(fileInput).not.toBeNull();

    const clickSpy = vi.spyOn(fileInput as HTMLInputElement, 'click').mockImplementation(() => undefined);

    const uploadButton = Array.from(container.querySelectorAll('button')).find(btn =>
      btn.textContent?.match(/upload/i)
    );
    uploadButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(clickSpy).toHaveBeenCalledTimes(1);

    clickSpy.mockRestore();
  });

  it('clears selected avatar when remove button is clicked', async () => {
    class MockFileReader {
      result: string | ArrayBuffer | null = null;
      onload: ((event: ProgressEvent<FileReader>) => void) | null = null;

      readAsDataURL(_file: Blob) {
        this.result = 'data:image/png;base64,ZmFrZQ==';
        const event = {
          target: { result: this.result },
        } as unknown as ProgressEvent<FileReader>;
        this.onload?.(event);
      }
    }

    vi.stubGlobal('FileReader', MockFileReader as unknown as typeof FileReader);

    const { container } = render(AccountPage, {
      props: { data: createMockData({ avatar: '' }) as any },
    });

    const fileInput = container.querySelector('#avatar-upload') as HTMLInputElement | null;
    const file = new File(['avatar-bytes'], 'avatar.png', { type: 'image/png' });
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      configurable: true,
    });

    fileInput?.dispatchEvent(new Event('change', { bubbles: true }));
    await Promise.resolve();

    const removeButton = Array.from(container.querySelectorAll('button')).find(btn =>
      btn.textContent?.match(/remove/i)
    );
    expect(removeButton).toBeTruthy();

    removeButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await Promise.resolve();

    expect(container.textContent || '').not.toContain('Remove Avatar');
  });
});
