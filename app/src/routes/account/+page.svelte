<script lang="ts">
  import { page } from '$app/state';
  import MfaCard from '$lib/components/account/MfaCard.svelte';
  import PasswordCard from '$lib/components/account/PasswordCard.svelte';
  import ProfileCard from '$lib/components/account/ProfileCard.svelte';
  import * as m from '$lib/paraglide/messages';
  import { mfaSchema, passwordSchema, profileSchema } from '$lib/schemas/account.js';
  import { toast } from '$lib/stores/toast';
  import { onMount } from 'svelte';
  import { MetaTags } from 'svelte-meta-tags';
  import { superForm } from 'sveltekit-superforms';
  import { zod4Client } from 'sveltekit-superforms/adapters';

  const metaTags = {
    title: 'Account Settings',
    description: 'Manage your account settings and preferences',
    openGraph: {
      title: 'Account Settings',
      description: 'Manage your account settings and preferences',
    },
  };

  const { data } = $props();

  let avatarUploaded = $state(false);

  // svelte-ignore state_referenced_locally
  const superFormObj = superForm(data.profileForm, {
    validators: zod4Client(profileSchema),
    resetForm: false,
    onResult: ({ result }) => {
      if (result.type === 'success') {
        toast(m['account.profile_updated'](), 'success');
        // Check if avatar was uploaded
        if (avatarUploaded) {
          toast(m['account.avatar_upload_success'](), 'success');
          avatarUploaded = false;
        }
      } else if (result.type === 'failure') {
        toast(m['account.profile_update_failed'](), 'error');
        avatarUploaded = false;
      }
    },
  });

  const {
    form,
    enhance: profileEnhance,
    message: profileMessage,
    capture: captureProfile,
    restore: restoreProfile,
  } = superFormObj;

  // Password change form
  // svelte-ignore state_referenced_locally
  const passwordFormObj = superForm(data.passwordForm, {
    validators: zod4Client(passwordSchema),
    resetForm: true,
    onResult: ({ result }) => {
      if (result.type === 'success') {
        toast(m['account.password_changed_success'](), 'success');
      }
    },
  });

  const { form: passwordForm, enhance: passwordEnhance, message: passwordMessage } = passwordFormObj;

  // MFA form
  // svelte-ignore state_referenced_locally
  const mfaFormObj = superForm(data.mfaForm, {
    validators: zod4Client(mfaSchema),
    resetForm: false,
    onResult: ({ result }) => {
      if (result.type === 'success') {
        const nextOptIn = (result.data as { mfaOptIn?: boolean } | undefined)?.mfaOptIn;
        if (typeof nextOptIn === 'boolean') {
          toast(
            nextOptIn ? m['account.2fa_enabled_success']() : m['account.2fa_disabled_success'](),
            nextOptIn ? 'success' : 'info'
          );
        }
      }
    },
  });

  const { form: mfaForm, enhance: mfaEnhance } = mfaFormObj;

  // Use Superforms snapshot support for browser navigation state preservation
  // Only preserve profile form state; passwords and 2FA shouldn't be preserved
  export const snapshot = { capture: captureProfile, restore: restoreProfile };

  // Check for email verification success on mount
  onMount(() => {
    const verifiedFlag = page?.url?.searchParams?.get('verified');
    if (verifiedFlag === 'true') {
      toast(m['account.email_verified_success'](), 'success');
    }
  });
</script>

<MetaTags {...metaTags} />

<div class="container mx-auto max-w-4xl py-8">
  <h1 class="mb-8 text-3xl font-bold">{m['account.title']()}</h1>
  <p class="mb-8 text-muted-foreground">{m['account.description']()}</p>

  <ProfileCard
    user={data.user}
    {superFormObj}
    {form}
    {profileEnhance}
    {profileMessage}
    onAvatarSelected={() => {
      avatarUploaded = true;
    }}
  />

  <MfaCard mfaRequired={data.mfaRequired} {mfaFormObj} {mfaForm} {mfaEnhance} />

  <PasswordCard {passwordFormObj} {passwordForm} {passwordEnhance} {passwordMessage} />
</div>
