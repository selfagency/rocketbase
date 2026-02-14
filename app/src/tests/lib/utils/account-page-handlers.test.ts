import * as m from '$lib/paraglide/messages';
import { describe, expect, it, vi } from 'vitest';
import {
  handleMfaResult,
  handlePasswordResult,
  handleProfileResult,
  handleVerifiedQueryFlag,
} from '../../../lib/utils/account-page-handlers';

describe('account-page-handlers', () => {
  it('handles profile success with avatar upload reset', () => {
    const toast = vi.fn();
    const next = handleProfileResult({ type: 'success' }, true, toast, m);

    expect(toast).toHaveBeenCalledWith(expect.any(String), 'success');
    expect(toast).toHaveBeenCalledTimes(2);
    expect(next).toBe(false);
  });

  it('keeps avatarUploaded=true on success when no avatar upload reset is needed', () => {
    const toast = vi.fn();
    const next = handleProfileResult({ type: 'success' }, false, toast, m);

    expect(toast).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith(expect.any(String), 'success');
    expect(next).toBe(false);
  });

  it('handles profile failure and resets avatarUploaded flag', () => {
    const toast = vi.fn();
    const next = handleProfileResult({ type: 'failure' }, true, toast, m);

    expect(toast).toHaveBeenCalledWith(expect.any(String), 'error');
    expect(next).toBe(false);
  });

  it('returns previous avatarUploaded state for non-success/failure profile result', () => {
    const toast = vi.fn();

    const nextTrue = handleProfileResult({ type: 'other' }, true, toast, m);
    const nextFalse = handleProfileResult({ type: 'other' }, false, toast, m);

    expect(toast).not.toHaveBeenCalled();
    expect(nextTrue).toBe(true);
    expect(nextFalse).toBe(false);
  });

  it('handles password result success only', () => {
    const toast = vi.fn();

    handlePasswordResult({ type: 'success' }, toast, m);
    handlePasswordResult({ type: 'failure' }, toast, m);

    expect(toast).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith(expect.any(String), 'success');
  });

  it('handles MFA result with opt-in true/false and ignores non-boolean', () => {
    const toast = vi.fn();

    handleMfaResult({ type: 'success', data: { mfaOptIn: true } }, toast, m);
    handleMfaResult({ type: 'success', data: { mfaOptIn: false } }, toast, m);
    handleMfaResult({ type: 'success', data: {} }, toast, m);

    expect(toast).toHaveBeenCalledTimes(2);
    expect(toast).toHaveBeenNthCalledWith(1, expect.any(String), 'success');
    expect(toast).toHaveBeenNthCalledWith(2, expect.any(String), 'info');
  });

  it('ignores MFA result when type is not success', () => {
    const toast = vi.fn();

    handleMfaResult({ type: 'failure', data: { mfaOptIn: true } }, toast, m);

    expect(toast).not.toHaveBeenCalled();
  });

  it('handles verified query flag only when true', () => {
    const toast = vi.fn();

    handleVerifiedQueryFlag('false', toast, m);
    handleVerifiedQueryFlag(null, toast, m);
    handleVerifiedQueryFlag('true', toast, m);

    expect(toast).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith(expect.any(String), 'success');
  });
});
