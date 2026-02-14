import { describe, expect, it, vi } from 'vitest';
import {
  createForgotPasswordOnUpdateHandler,
  shouldShowForgotPasswordSuccessFromAction,
  shouldShowForgotPasswordSuccessFromUpdate,
} from '../../../lib/utils/forgot-password-handlers';

describe('forgot-password-handlers', () => {
  it('detects success from action data', () => {
    expect(shouldShowForgotPasswordSuccessFromAction({ success: true })).toBe(true);
    expect(shouldShowForgotPasswordSuccessFromAction({ success: false })).toBe(false);
    expect(shouldShowForgotPasswordSuccessFromAction(undefined)).toBe(false);
  });

  it('detects success from valid form update payload', () => {
    expect(
      shouldShowForgotPasswordSuccessFromUpdate({
        form: { valid: true },
        result: { data: { success: true } },
      })
    ).toBe(true);

    expect(
      shouldShowForgotPasswordSuccessFromUpdate({
        form: { valid: false },
        result: { data: { success: true } },
      })
    ).toBe(false);

    expect(
      shouldShowForgotPasswordSuccessFromUpdate({
        form: { valid: true },
        result: { data: { success: false } },
      })
    ).toBe(false);
  });

  it('createForgotPasswordOnUpdateHandler sets success only when payload indicates success', () => {
    const setShowSuccess = vi.fn();
    const onUpdate = createForgotPasswordOnUpdateHandler({ setShowSuccess });

    onUpdate({
      form: { valid: true },
      result: { data: { success: true } },
    });

    onUpdate({
      form: { valid: true },
      result: { data: { success: false } },
    });

    expect(setShowSuccess).toHaveBeenCalledTimes(1);
    expect(setShowSuccess).toHaveBeenCalledWith(true);
  });
});
