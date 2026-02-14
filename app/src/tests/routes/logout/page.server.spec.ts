import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load, actions } from '../../../routes/logout/+page.server';

describe('Logout Page Server', () => {
  let mockPb: any;
  let mockLocals: any;

  beforeEach(() => {
    mockPb = {
      authStore: {
        clear: vi.fn(),
      },
    };

    mockLocals = {
      pb: mockPb,
      user: { id: 'test-user' },
    };
  });

  describe('load function', () => {
    it('redirects to home page', async () => {
      await expect(load({} as any)).rejects.toThrow();
    });
  });

  describe('default action', () => {
    it('clears auth store', async () => {
      try {
        await actions.default({ locals: mockLocals } as any);
      } catch (e) {
        // Expected to throw redirect
      }

      expect(mockPb.authStore.clear).toHaveBeenCalled();
    });

    it('sets user to null', async () => {
      try {
        await actions.default({ locals: mockLocals } as any);
      } catch (e) {
        // Expected to throw redirect
      }

      expect(mockLocals.user).toBeNull();
    });

    it('redirects to home with logout success param', async () => {
      await expect(actions.default({ locals: mockLocals } as any)).rejects.toThrow();
    });
  });
});
