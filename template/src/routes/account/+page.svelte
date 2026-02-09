<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as m from '$lib/paraglide/messages';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';

	const { data } = $props();

	const profileSchema = z.object({
		name: z.string().min(2, m['validation.name_min_length']()),
		email: z.email(m['validation.email_invalid']()),
		title: z.string().optional(),
		bio: z.string().optional(),
		website: z.string().url().optional().or(z.literal('')),
		avatar: z.instanceof(File).optional()
	});

	const passwordSchema = z
		.object({
			oldPassword: z.string().min(8, m['validation.password_min_length']()),
			password: z.string().min(8, m['validation.password_min_length']()),
			passwordConfirm: z.string().min(8, m['validation.password_min_length']())
		})
		.refine((data) => data.password === data.passwordConfirm, {
			message: m['validation.password_mismatch'](),
			path: ['passwordConfirm']
		});

	let avatarPreview = $state<string | null>(null);

	// svelte-ignore state_referenced_locally
	const superFormObj = superForm(data.profileForm, {
		validators: zod4Client(profileSchema),
		resetForm: false,
		onUpdated: ({ form }) => {
			if (form.valid) {
				avatarPreview = null;
				toast.success(m['account.profile_updated']());
			}
		}
	});

	const { form, enhance: profileEnhance, message: profileMessage } = superFormObj;

	// Password change form
	// svelte-ignore state_referenced_locally
	const passwordFormObj = superForm(data.passwordForm, {
		validators: zod4Client(passwordSchema),
		resetForm: true,
		onUpdated: ({ form }) => {
			if (form.valid && form.posted) {
				toast.success(m['account.password_changed_success']());
			}
		}
	});

	const {
		form: passwordForm,
		enhance: passwordEnhance,
		message: passwordMessage
	} = passwordFormObj;

	let savedMfaOptIn = $state(false);
	let uiMfaOptIn = $state(false);
	let mfaPending = $state(false);
	let mfaMessage = $state<string | null>(null);
	let mfaFormRef = $state<HTMLFormElement | null>(null);
	let mfaInitialized = $state(false);
	let verificationEmailSent = $state(false);

	$effect(() => {
		const verifiedFlag = page?.url?.searchParams?.get('verified');
		if (verifiedFlag === 'true') {
			toast.success(m['account.email_verified_success']());
		}
	});

	$effect(() => {
		if (mfaInitialized) return;
		if (typeof data.mfaOptIn === 'boolean') {
			savedMfaOptIn = data.mfaOptIn;
			uiMfaOptIn = data.mfaOptIn;
			mfaInitialized = true;
		}
	});

	$effect(() => {
		if (!mfaFormRef) return;
		if (uiMfaOptIn === savedMfaOptIn) return;
		if (mfaPending) return;
		mfaPending = true;
		mfaMessage = null;
		mfaFormRef.requestSubmit();
	});

	function handleAvatarChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			$form.avatar = file;
			const reader = new FileReader();
			reader.onload = (e) => {
				avatarPreview = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	function getAvatarUrl(user: typeof data.user) {
		if (user.avatar) {
			return `${PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090'}/api/files/_pb_users_auth_/${user.id}/${user.avatar}`;
		}
		return null;
	}

	const getDisplayName = (user?: { name?: string | null; email?: string | null }) => {
		return user?.name || user?.email || 'User';
	};

	const getInitials = (user?: { name?: string | null; email?: string | null }) => {
		const display = getDisplayName(user).trim();
		const parts = display.split(/\s+/).filter(Boolean);
		if (parts.length === 0) return 'U';
		if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	};

	async function handleSendVerificationEmail() {
		const formData = new FormData();
		const response = await fetch('?/sendVerificationEmail', {
			method: 'POST',
			body: formData
		});

		if (response.ok) {
			verificationEmailSent = true;
			toast.success(m['account.email_verification_sent']());
		} else {
			toast.error('Failed to send verification email');
		}
	}
</script>

<div class="container mx-auto max-w-4xl py-8">
	<h1 class="mb-8 text-3xl font-bold">{m['account.title']()}</h1>
	<p class="mb-8 text-muted-foreground">{m['account.description']()}</p>

	<!-- Profile Form -->
	<Card class="mb-8">
		<CardHeader class="flex flex-row items-center justify-between">
			<CardTitle>{m['account.profile_section']()}</CardTitle>
			<Badge variant="secondary" class="capitalize">{data.user.role}</Badge>
		</CardHeader>
		<CardContent>
			<form method="POST" action="?/updateProfile" use:profileEnhance enctype="multipart/form-data">
				<div class="space-y-4">
					{#if $profileMessage}
						<Alert variant="destructive">
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>{$profileMessage}</AlertDescription>
						</Alert>
					{/if}
					<!-- Avatar -->
					<div class="space-y-2">
						<Label>{m['account.avatar_label']()}</Label>
						<div class="flex items-start gap-4">
							<div>
								<Avatar.Root class="h-24 w-24 rounded-lg">
									{#if avatarPreview}
										<Avatar.Image src={avatarPreview} alt="Avatar preview" />
									{:else if data.user.avatar}
										<Avatar.Image
											src={getAvatarUrl(data.user) || undefined}
											alt={getDisplayName(data.user)}
										/>
									{/if}
									<Avatar.Fallback>{getInitials(data.user)}</Avatar.Fallback>
								</Avatar.Root>
							</div>
							<div class="flex flex-col gap-2 pt-1">
								<input
									type="file"
									accept="image/*"
									name="avatar"
									id="avatar-upload"
									class="hidden"
									onchange={handleAvatarChange}
								/>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onclick={() => document.getElementById('avatar-upload')?.click()}
								>
									Upload Image
								</Button>
								{#if avatarPreview || data.user.avatar}
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onclick={() => {
											avatarPreview = null;
											$form.avatar = undefined;
										}}
									>
										Remove
									</Button>
								{/if}
							</div>
						</div>
					</div>

					<!-- Name -->
					<Form.Field form={superFormObj} name="name">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>{m['account.name_label']()}</Form.Label>
								<Input {...props} bind:value={$form.name} type="text" required />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<!-- Email with Verification Indicator -->
					<div>
						<Form.Field form={superFormObj} name="email">
							<Form.Control>
								{#snippet children({ props })}
									<div class="flex items-center gap-2">
										<Form.Label>{m['account.email_label']()}</Form.Label>
										{#if data.user.verified}
											<Badge variant="default" class="bg-green-100 text-green-800">
												{m['account.verified_badge']()}
											</Badge>
										{/if}
									</div>
									<Input {...props} bind:value={$form.email} type="email" required />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						{#if !data.user.verified}
							{#if verificationEmailSent}
								<div class="mt-3 rounded-md bg-amber-50 p-3" data-testid="email-verification-sent">
									<p class="text-sm text-amber-800">
										Please check your inbox for a verification email. The link will expire in 24
										hours.
									</p>
								</div>
							{:else}
								<div class="mt-3 rounded-md bg-amber-50 p-3">
									<p class="mb-2 text-sm text-amber-800">
										{m['account.email_not_verified_description']()}
									</p>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onclick={() => handleSendVerificationEmail()}
										data-testid="send-verification-email-button"
									>
										{m['account.email_verification_button']()}
									</Button>
								</div>
							{/if}
						{/if}
					</div>

					<!-- Title -->
					<Form.Field form={superFormObj} name="title">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>{m['account.title_label']()}</Form.Label>
								<Input {...props} bind:value={$form.title} type="text" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<!-- Bio -->
					<Form.Field form={superFormObj} name="bio">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>{m['account.bio_label']()}</Form.Label>
								<Textarea {...props} bind:value={$form.bio} rows={4} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<!-- Website -->
					<Form.Field form={superFormObj} name="website">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>{m['account.website_label']()}</Form.Label>
								<Input
									{...props}
									bind:value={$form.website}
									type="url"
									placeholder="https://example.com"
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<div class="flex gap-4">
						<Button type="submit">{m['account.save_button']()}</Button>
						<Button type="button" variant="outline" onclick={() => window.location.reload()}>
							{m['account.cancel_button']()}
						</Button>
					</div>
				</div>
			</form>
		</CardContent>
	</Card>

	<!-- Two-Factor Authentication -->
	<Card class="mb-8">
		<CardHeader>
			<CardTitle>{m['account.2fa_title']()}</CardTitle>
			<CardDescription>{m['account.2fa_description']()}</CardDescription>
		</CardHeader>
		<CardContent>
			{#if data.mfaRequired}
				<Alert>
					<AlertTitle>{m['account.2fa_required_title']()}</AlertTitle>
					<AlertDescription>
						{m['account.2fa_required_info']()}
					</AlertDescription>
				</Alert>
			{:else}
				<Alert>
					<AlertTitle>
						{uiMfaOptIn ? m['account.2fa_enabled_title']() : m['account.2fa_not_required_title']()}
					</AlertTitle>
					<AlertDescription>
						{uiMfaOptIn ? m['account.2fa_opted_in_info']() : m['account.2fa_opt_in_info']()}
					</AlertDescription>
				</Alert>
				{#if mfaMessage}
					<Alert class="mt-4" variant="destructive">
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{mfaMessage}</AlertDescription>
					</Alert>
				{/if}
				<form
					method="POST"
					action="?/toggleMfaOptIn"
					class="mt-4 flex items-center gap-3"
					use:enhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') {
								const nextOptIn = (result.data as { mfaOptIn?: boolean } | undefined)?.mfaOptIn;
								if (typeof nextOptIn === 'boolean') {
									savedMfaOptIn = nextOptIn;
									uiMfaOptIn = nextOptIn;
									toast.success(
										nextOptIn
											? m['account.2fa_enabled_success']()
											: m['account.2fa_disabled_success']()
									);
								} else {
									savedMfaOptIn = uiMfaOptIn;
								}
							} else if (result.type === 'failure') {
								uiMfaOptIn = savedMfaOptIn;
								mfaMessage =
									(result.data as { message?: string } | undefined)?.message ??
									m['account.error_message']();
							}
							mfaPending = false;
							await update();
						};
					}}
					bind:this={mfaFormRef}
				>
					<input type="hidden" name="mfaOptIn" value={uiMfaOptIn ? 'true' : 'false'} />
					<Switch id="mfa-opt-in" bind:checked={uiMfaOptIn} disabled={mfaPending} />
					<Label for="mfa-opt-in">
						{uiMfaOptIn ? m['account.2fa_disable_button']() : m['account.2fa_enable_button']()}
					</Label>
				</form>
			{/if}
		</CardContent>
	</Card>

	<!-- Password Change -->
	<Card>
		<CardHeader>
			<CardTitle>{m['account.password_section']()}</CardTitle>
		</CardHeader>
		<CardContent>
			<Alert class="mb-4">
				<AlertTitle>Warning</AlertTitle>
				<AlertDescription>
					Changing your password will require you to login again with your new password.
				</AlertDescription>
			</Alert>
			<form method="POST" action="?/changePassword" use:passwordEnhance>
				<div class="space-y-4">
					{#if $passwordMessage}
						<Alert variant="destructive">
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>{$passwordMessage}</AlertDescription>
						</Alert>
					{/if}

					<Form.Field form={passwordFormObj} name="oldPassword">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>{m['account.current_password_label']()}</Form.Label>
								<Input {...props} bind:value={$passwordForm.oldPassword} type="password" required />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field form={passwordFormObj} name="password">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>{m['account.new_password_label']()}</Form.Label>
								<Input {...props} bind:value={$passwordForm.password} type="password" required />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field form={passwordFormObj} name="passwordConfirm">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>{m['account.confirm_password_label']()}</Form.Label>
								<Input
									{...props}
									bind:value={$passwordForm.passwordConfirm}
									type="password"
									required
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Button type="submit">{m['account.change_password_button']()}</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
<!-- Password Change (we already added mb-8 above) -->
