import { toasts } from '$lib/stores/toast.js';
import { toast } from 'svelte-sonner';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Toaster from './Toaster.svelte';

vi.mock('mode-watcher', () => ({
  mode: { current: 'light' },
}));

vi.mock('svelte-sonner', async () => {
  const MockToaster = (await import('../../../tests/mocks/MockToaster.svelte')).default;

  return {
    Toaster: MockToaster,
    toast: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
    },
  };
});

describe('Toaster component', () => {
  let cleanup: (() => void) | undefined;

  beforeEach(() => {
    toasts.current = [];
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup?.();
    cleanup = undefined;
  });

  it('shows queued toasts', async () => {
    const { unmount } = render(Toaster);
    cleanup = unmount;

    const timestamp = new Date('2020-01-01T00:00:00.000Z');
    toasts.current = [{ timestamp, message: 'Hello', type: 'success' }];

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith('Hello');
  });

  it('ignores duplicate toasts with the same key', async () => {
    const { unmount } = render(Toaster);
    cleanup = unmount;

    const timestamp = new Date('2020-01-01T00:00:00.000Z');
    toasts.current = [
      { timestamp, message: 'Hello', type: 'success' },
      { timestamp: new Date('2020-01-01T00:00:00.000Z'), message: 'Hello', type: 'success' },
    ];

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(toast.success).toHaveBeenCalledTimes(1);
  });

  it('replays a toast after the queue is cleared', async () => {
    const { unmount } = render(Toaster);
    cleanup = unmount;

    const timestamp = new Date('2020-01-01T00:00:00.000Z');
    const toastData = { timestamp, message: 'Hello', type: 'success' } as const;

    toasts.current = [toastData];
    await new Promise(resolve => setTimeout(resolve, 0));

    toasts.current = [];
    await new Promise(resolve => setTimeout(resolve, 0));

    toasts.current = [toastData];
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(toast.success).toHaveBeenCalledTimes(2);
  });
});
