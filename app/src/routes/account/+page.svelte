<script lang="ts">
  import { page } from '$app/state';
  import MfaCard from '$lib/components/account/MfaCard.svelte';
  import PasswordCard from '$lib/components/account/PasswordCard.svelte';
  import ProfileCard from '$lib/components/account/ProfileCard.svelte';
  import * as m from '$lib/paraglide/messages';
  import { mfaSchema, passwordSchema, profileSchema } from '$lib/schemas/account';
  import { toast } from '$lib/stores/toast';
  import {
    createMfaOnResultHandler,
    createPasswordOnResultHandler,
    createProfileHandlers,
    handleVerifiedQueryFlag,
  } from '$lib/utils/account-page-handlers';
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

  const profileHandlers = createProfileHandlers({ toast, messages: m });
  const profileOnResult = profileHandlers.onResult;

  const passwordOnResult = createPasswordOnResultHandler({ toast, messages: m });
  const mfaOnResult = createMfaOnResultHandler({ toast, messages: m });

  // svelte-ignore state_referenced_locally
  const superFormObj = superForm(data.profileForm, {
    validators: zod4Client(profileSchema),
    resetForm: false,
    onResult: profileOnResult,
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
    onResult: passwordOnResult,
  });

  const { form: passwordForm, enhance: passwordEnhance, message: passwordMessage } = passwordFormObj;

  // MFA form
  // svelte-ignore state_referenced_locally
  const mfaFormObj = superForm(data.mfaForm, {
    validators: zod4Client(mfaSchema),
    resetForm: false,
    onResult: mfaOnResult,
  });

  const { form: mfaForm, enhance: mfaEnhance } = mfaFormObj;

  // Use Superforms snapshot support for browser navigation state preservation
  // Only preserve profile form state; passwords and 2FA shouldn't be preserved
  export const snapshot = { capture: captureProfile, restore: restoreProfile };

  // Check for email verification success on mount
  onMount(() => {
    handleVerifiedQueryFlag(page?.url?.searchParams?.get('verified') ?? null, toast, m);
  });
</script>

<MetaTags {...metaTags} />

<div class="mx-auto w-full max-w-4xl px-4 py-8 md:py-10">
  <h1 class="mb-8 text-3xl font-bold">{m['account.title']()}</h1>
  <p class="mb-8 text-muted-foreground">{m['account.description']()}</p>

  <ProfileCard
    user={data.user}
    {superFormObj}
    {form}
    {profileEnhance}
    {profileMessage}
    onAvatarSelected={profileHandlers.markAvatarUploaded}
  />

  <MfaCard mfaRequired={data.mfaRequired} {mfaFormObj} {mfaForm} {mfaEnhance} />

  <PasswordCard {passwordFormObj} {passwordForm} {passwordEnhance} {passwordMessage} />
</div>
