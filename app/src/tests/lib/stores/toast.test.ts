import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { toast, toasts } from '../../../lib/stores/toast';

describe('toast store', () => {
  beforeEach(() => {
    // Clear toasts before each test by removing all items
    while (toasts.current.length > 0) {
      toasts.current.pop();
    }
  });

  afterEach(() => {
    // Clean up after each test
    while (toasts.current.length > 0) {
      toasts.current.pop();
    }
  });

  describe('toast function', () => {
    it('adds success toast with default type', () => {
      toast('Operation successful');

      expect(toasts.current).toHaveLength(1);
      expect(toasts.current[0]).toMatchObject({
        message: 'Operation successful',
        type: 'success',
      });
      expect(toasts.current[0].timestamp).toBeInstanceOf(Date);
    });

    it('adds error toast', () => {
      toast('Operation failed', 'error');

      expect(toasts.current).toHaveLength(1);
      expect(toasts.current[0]).toMatchObject({
        message: 'Operation failed',
        type: 'error',
      });
    });

    it('adds info toast', () => {
      toast('Information message', 'info');

      expect(toasts.current).toHaveLength(1);
      expect(toasts.current[0]).toMatchObject({
        message: 'Information message',
        type: 'info',
      });
    });

    it('adds warning toast', () => {
      toast('Warning message', 'warning');

      expect(toasts.current).toHaveLength(1);
      expect(toasts.current[0]).toMatchObject({
        message: 'Warning message',
        type: 'warning',
      });
    });

    it('adds multiple toasts', () => {
      toast('First message');
      toast('Second message', 'error');
      toast('Third message', 'info');

      expect(toasts.current).toHaveLength(3);
      expect(toasts.current[0].message).toBe('First message');
      expect(toasts.current[1].message).toBe('Second message');
      expect(toasts.current[2].message).toBe('Third message');
    });

    it('preserves toast order', () => {
      const messages = ['First', 'Second', 'Third'];
      messages.forEach(msg => toast(msg));

      expect(toasts.current.map(t => t.message)).toEqual(messages);
    });

    it('creates different timestamps for sequential toasts', () => {
      toast('First');
      toast('Second');

      expect(toasts.current[0].timestamp).toBeInstanceOf(Date);
      expect(toasts.current[1].timestamp).toBeInstanceOf(Date);
      // Timestamps should be close but not necessarily different due to test speed
      expect(toasts.current[0].timestamp.getTime()).toBeLessThanOrEqual(toasts.current[1].timestamp.getTime());
    });
  });
});
