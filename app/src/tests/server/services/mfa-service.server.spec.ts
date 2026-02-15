import { describe, expect, it, vi } from 'vitest';
import {
  disableTwoFactor,
  requestTwoFactorOtp,
  updateMfaOptIn,
  verifyTwoFactorOtp,
} from '../../../lib/server/services/mfa-service';

describe('mfa-service', () => {
  it('updates MFA opt-in and refreshes auth', async () => {
    const update = vi.fn().mockResolvedValue(undefined);
    const authRefresh = vi.fn().mockResolvedValue(undefined);
    const record = { id: 'u1', mfaOptIn: true };

    const pb = {
      collection: vi.fn(() => ({ update, authRefresh })),
      authStore: { record },
    };

    const result = await updateMfaOptIn(pb, 'u1', true);

    expect(update).toHaveBeenCalledWith('u1', { mfaOptIn: true });
    expect(authRefresh).toHaveBeenCalledTimes(1);
    expect(result).toBe(record);
  });

  it('requests OTP and returns otpId', async () => {
    const requestOTP = vi.fn().mockResolvedValue({ otpId: 'otp-123' });
    const pb = {
      collection: vi.fn(() => ({ requestOTP })),
      authStore: { record: null },
    };

    const result = await requestTwoFactorOtp(pb, 'user@example.com');
    expect(result).toEqual({ otpId: 'otp-123' });
  });

  it('returns false when OTP record does not exist', async () => {
    const pb = {
      collection: vi.fn((name: string) => {
        if (name === '_otps') return { getFullList: vi.fn().mockResolvedValue([]) };
        return { authWithOTP: vi.fn(), create: vi.fn() };
      }),
      authStore: { record: null },
    };

    const ok = await verifyTwoFactorOtp(pb, 'u1', 'otp-1', '123456');
    expect(ok).toBe(false);
  });

  it('verifies OTP and creates MFA record', async () => {
    const getFullList = vi.fn().mockResolvedValue([{ id: 'otp-1', recordRef: 'u1' }]);
    const authWithOTP = vi.fn().mockResolvedValue(undefined);
    const create = vi.fn().mockResolvedValue(undefined);

    const pb = {
      collection: vi.fn((name: string) => {
        if (name === '_otps') return { getFullList };
        if (name === '_mfas') return { create };
        return { authWithOTP };
      }),
      authStore: { record: null },
    };

    const ok = await verifyTwoFactorOtp(pb, 'u1', 'otp-1', '123456');

    expect(ok).toBe(true);
    expect(authWithOTP).toHaveBeenCalledWith('otp-1', '123456');
    expect(create).toHaveBeenCalledWith({
      collectionRef: 'users',
      recordRef: 'u1',
      method: 'otp',
    });
  });

  it('disables two-factor by deleting all MFA records', async () => {
    const getFullList = vi.fn().mockResolvedValue([{ id: 'm1' }, { id: 'm2' }]);
    const del = vi.fn().mockResolvedValue(undefined);

    const pb = {
      collection: vi.fn(() => ({ getFullList, delete: del })),
      authStore: { record: null },
    };

    await disableTwoFactor(pb, 'u1');

    expect(getFullList).toHaveBeenCalledWith({ filter: 'recordRef = "u1"' });
    expect(del).toHaveBeenCalledWith('m1');
    expect(del).toHaveBeenCalledWith('m2');
  });
});
