type PocketBaseLike = {
  collection: (name: string) => {
    update?: (id: string, data: Record<string, unknown>) => Promise<unknown>;
    requestOTP?: (email: string) => Promise<{ otpId: string }>;
    getFullList?: (query?: { filter?: string }) => Promise<Array<{ id: string; recordRef?: string }>>;
    authWithOTP?: (otpId: string, code: string) => Promise<unknown>;
    create?: (data: Record<string, unknown>) => Promise<unknown>;
    delete?: (id: string) => Promise<unknown>;
    authRefresh?: () => Promise<unknown>;
  };
  authStore: {
    record: unknown;
  };
};

export async function updateMfaOptIn(pb: PocketBaseLike, userId: string, mfaOptIn: boolean): Promise<unknown> {
  await pb.collection('users').update?.(userId, { mfaOptIn });
  await pb.collection('users').authRefresh?.();
  return pb.authStore.record;
}

export async function requestTwoFactorOtp(pb: PocketBaseLike, email: string): Promise<{ otpId: string }> {
  const response = await pb.collection('users').requestOTP?.(email);
  return response as { otpId: string };
}

export async function verifyTwoFactorOtp(
  pb: PocketBaseLike,
  userId: string,
  otpId: string,
  code: string
): Promise<boolean> {
  const otps = await pb.collection('_otps').getFullList?.({ filter: `id = "${otpId}" && recordRef = "${userId}"` });

  if (!otps || otps.length === 0) {
    return false;
  }

  await pb.collection('users').authWithOTP?.(otpId, code);
  await pb.collection('_mfas').create?.({
    collectionRef: 'users',
    recordRef: userId,
    method: 'otp',
  });

  return true;
}

export async function disableTwoFactor(pb: PocketBaseLike, userId: string): Promise<void> {
  const mfas = await pb.collection('_mfas').getFullList?.({ filter: `recordRef = "${userId}"` });

  for (const mfa of mfas || []) {
    await pb.collection('_mfas').delete?.(mfa.id);
  }
}
