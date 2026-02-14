import type * as m from '$lib/paraglide/messages';

type ToastType = 'success' | 'error' | 'info' | 'warning';
type ToastFn = (message: string, type: ToastType) => void;

type MessageModule = typeof m;

type FormResult = {
  type: string;
  data?: {
    mfaOptIn?: boolean;
  };
};

export function handleProfileResult(
  result: FormResult,
  avatarUploaded: boolean,
  toast: ToastFn,
  messages: MessageModule
): boolean {
  if (result.type === 'success') {
    toast(messages['account.profile_updated'](), 'success');
    if (avatarUploaded) {
      toast(messages['account.avatar_upload_success'](), 'success');
      return false;
    }
    return avatarUploaded;
  }

  if (result.type === 'failure') {
    toast(messages['account.profile_update_failed'](), 'error');
    return false;
  }

  return avatarUploaded;
}

export function handlePasswordResult(result: FormResult, toast: ToastFn, messages: MessageModule): void {
  if (result.type === 'success') {
    toast(messages['account.password_changed_success'](), 'success');
  }
}

export function handleMfaResult(result: FormResult, toast: ToastFn, messages: MessageModule): void {
  if (result.type !== 'success') return;

  const nextOptIn = result.data?.mfaOptIn;
  if (typeof nextOptIn !== 'boolean') return;

  toast(
    nextOptIn ? messages['account.2fa_enabled_success']() : messages['account.2fa_disabled_success'](),
    nextOptIn ? 'success' : 'info'
  );
}

export function handleVerifiedQueryFlag(verifiedFlag: string | null, toast: ToastFn, messages: MessageModule): void {
  if (verifiedFlag === 'true') {
    toast(messages['account.email_verified_success'](), 'success');
  }
}

type ProfileResultPayload = { result: FormResult };

export function createProfileHandlers(params: { toast: ToastFn; messages: MessageModule }) {
  let avatarUploaded = false;

  return {
    markAvatarUploaded: () => {
      avatarUploaded = true;
    },
    onResult: ({ result }: ProfileResultPayload) => {
      avatarUploaded = handleProfileResult(result, avatarUploaded, params.toast, params.messages);
    },
  };
}

export function createProfileOnResultHandler(params: {
  getAvatarUploaded: () => boolean;
  setAvatarUploaded: (value: boolean) => void;
  toast: ToastFn;
  messages: MessageModule;
}) {
  return ({ result }: ProfileResultPayload) => {
    const nextAvatarUploaded = handleProfileResult(result, params.getAvatarUploaded(), params.toast, params.messages);
    params.setAvatarUploaded(nextAvatarUploaded);
  };
}

export function createPasswordOnResultHandler(params: { toast: ToastFn; messages: MessageModule }) {
  return ({ result }: ProfileResultPayload) => {
    handlePasswordResult(result, params.toast, params.messages);
  };
}

export function createMfaOnResultHandler(params: { toast: ToastFn; messages: MessageModule }) {
  return ({ result }: ProfileResultPayload) => {
    handleMfaResult(result, params.toast, params.messages);
  };
}
