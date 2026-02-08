<script lang="ts">
	import { enhance } from '$app/forms';
	import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as m from '$lib/paraglide/messages';
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

	const twoFactorRequestSchema = z.object({
		// No fields needed
	});

	const twoFactorVerifySchema = z.object({
		otpId: z.string(),
		code: z.string().length(6, 'Code must be 6 digits')
	});

	let avatarPreview = $state<string | null>(null);

	// svelte-ignore state_referenced_locally
	const {
		form: profileData,
		enhance: profileEnhance,
		errors: profileErrors
	} = superForm(data.profileForm, {
		validators: zod4Client(profileSchema),
		onResult: ({ result }) => {
			if (result.type === 'success') {
				// Successfully updated - form will be updated with server response
				avatarPreview = null; // Clear avatar preview after successful upload
			}
		}
	});

	// svelte-ignore state_referenced_locally
	let twoFactorEnabled = $state(data.twoFactorEnabled);
	let showTwoFactorSetup = $state(false);
	let otpRequested = $state(false);
	let currentOtpId = $state('');

	// svelte-ignore state_referenced_locally
	const {
		form: twoFactorVerifyData,
		enhance: twoFactorVerifyEnhance,
		errors: twoFactorVerifyErrors
	} = superForm(data.twoFactorVerifyForm, {
		validators: zod4Client(twoFactorVerifySchema),
		onResult: ({ result }) => {
			if (result.type === 'success' && result.data?.twoFactorEnabled) {
				twoFactorEnabled = true;
				showTwoFactorSetup = false;
				otpRequested = false;
			}
		}
	});

	// svelte-ignore state_referenced_locally
	const {
		form: twoFactorRequestData,
		enhance: twoFactorRequestEnhance,
		errors: twoFactorRequestErrors
	} = superForm(data.twoFactorRequestForm, {
		validators: zod4Client(twoFactorRequestSchema),
		onResult: ({ result }) => {
			if (result.type === 'success' && result.data?.otpId) {
				currentOtpId = result.data.otpId;
				otpRequested = true;
				// Update the verify form's otpId
				$twoFactorVerifyData.otpId = result.data.otpId;
			}
		},
		resetForm: false
	});

	// Check if OTP was requested on page load (from form action return)
	$effect(() => {
		if ((data as any).otpRequested && (data as any).otpId) {
			otpRequested = true;
			currentOtpId = (data as any).otpId;
			showTwoFactorSetup = true;
		}
	});

	function handleAvatarChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
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
</script>

<div class="container mx-auto max-w-4xl py-8">
	<h1 class="mb-8 text-3xl font-bold">{m['account.title']()}</h1>
	<p class="mb-8 text-muted-foreground">{m['account.description']()}</p>

	<!-- Profile Form -->
	<Card class="mb-8">
		<CardHeader>
			<CardTitle>{m['account.profile_section']()}</CardTitle>
		</CardHeader>
		<CardContent>
			<form method="POST" action="?/updateProfile" use:profileEnhance enctype="multipart/form-data">
				<div class="space-y-4">
					<!-- Avatar -->
					<div class="space-y-2">
						<Label for="avatar">{m['account.avatar_label']()}</Label>
						{#if avatarPreview}
							<div class="mb-2">
								<img
									src={avatarPreview}
									alt="Avatar preview"
									class="h-24 w-24 rounded-full object-cover"
								/>
							</div>
						{:else if data.user.avatar}
							<div class="mb-2">
								<img
									src={getAvatarUrl(data.user)}
									alt="Current avatar"
									class="h-24 w-24 rounded-full object-cover"
								/>
							</div>
						{/if}
						<Input
							id="avatar"
							name="avatar"
							type="file"
							accept="image/*"
							onchange={handleAvatarChange}
						/>
						{#if $profileErrors.avatar}
							<p class="text-sm text-destructive">
								{$profileErrors.avatar}
							</p>
						{/if}
					</div>

					<!-- Name -->
					<div class="space-y-2">
						<Label for="name">{m['account.name_label']()}</Label>
						<Input id="name" name="name" type="text" bind:value={$profileData.name} required />
						{#if $profileErrors.name}
							<p class="text-sm text-destructive">
								{$profileErrors.name}
							</p>
						{/if}
					</div>

					<!-- Email -->
					<div class="space-y-2">
						<Label for="email">{m['account.email_label']()}</Label>
						<Input id="email" name="email" type="email" bind:value={$profileData.email} required />
						{#if $profileErrors.email}
							<p class="text-sm text-destructive">
								{$profileErrors.email}
							</p>
						{/if}
					</div>

					<!-- Title -->
					<div class="space-y-2">
						<Label for="title">{m['account.title_label']()}</Label>
						<Input id="title" name="title" type="text" bind:value={$profileData.title} />
						{#if $profileErrors.title}
							<p class="text-sm text-destructive">
								{$profileErrors.title}
							</p>
						{/if}
					</div>

					<!-- Bio -->
					<div class="space-y-2">
						<Label for="bio">{m['account.bio_label']()}</Label>
						<Textarea id="bio" name="bio" bind:value={$profileData.bio} rows={4} />
						{#if $profileErrors.bio}
							<p class="text-sm text-destructive">
								{$profileErrors.bio}
							</p>
						{/if}
					</div>

					<!-- Website -->
					<div class="space-y-2">
						<Label for="website">{m['account.website_label']()}</Label>
						<Input
							id="website"
							name="website"
							type="url"
							bind:value={$profileData.website}
							placeholder="https://example.com"
						/>
						{#if $profileErrors.website}
							<p class="text-sm text-destructive">
								{$profileErrors.website}
							</p>
						{/if}
					</div>

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
	<Card>
		<CardHeader>
			<CardTitle>{m['account.2fa_title']()}</CardTitle>
			<CardDescription>{m['account.2fa_description']()}</CardDescription>
		</CardHeader>
		<CardContent>
			{#if twoFactorEnabled}
				<Alert class="mb-4">
					<AlertTitle>{m['account.2fa_enabled']()}</AlertTitle>
					<AlertDescription>
						Your account is protected with two-factor authentication.
					</AlertDescription>
				</Alert>
				<form
					method="POST"
					action="?/disableTwoFactor"
					use:enhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') {
								twoFactorEnabled = false;
							}
							await update();
						};
					}}
				>
					<Button type="submit" variant="destructive">{m['account.2fa_disable_button']()}</Button>
				</form>
			{:else}
				<Alert class="mb-4">
					<AlertTitle>{m['account.2fa_disabled']()}</AlertTitle>
					<AlertDescription>
						Enable two-factor authentication to add an extra layer of security.
					</AlertDescription>
				</Alert>

				{#if !showTwoFactorSetup}
					<Button onclick={() => (showTwoFactorSetup = true)}>
						{m['account.2fa_enable_button']()}
					</Button>
				{:else}
					<div class="space-y-4">
						<h3 class="text-lg font-semibold">
							{m['account.2fa_setup_title']()}
						</h3>
						<p class="text-sm text-muted-foreground">
							We'll send a 6-digit verification code to {data.user.email}
						</p>

						{#if !otpRequested}
							<form method="POST" action="?/requestTwoFactor" use:twoFactorRequestEnhance>
								<Button type="submit">{m['account.2fa_request_button']()}</Button>
							</form>
						{:else}
							<form method="POST" action="?/verifyTwoFactor" use:twoFactorVerifyEnhance>
								<input type="hidden" name="otpId" bind:value={$twoFactorVerifyData.otpId} />
								<div class="space-y-4">
									<div class="space-y-2">
										<Label for="code">{m['account.2fa_code_label']()}</Label>
										<Input
											id="code"
											name="code"
											type="text"
											bind:value={$twoFactorVerifyData.code}
											placeholder={m['account.2fa_code_placeholder']()}
											maxlength={6}
											required
										/>
										{#if $twoFactorVerifyErrors.code}
											<p class="text-sm text-destructive">
												{$twoFactorVerifyErrors.code}
											</p>
										{/if}
									</div>
									<Button type="submit">{m['account.2fa_verify_button']()}</Button>
								</div>
							</form>
						{/if}
					</div>
				{/if}
			{/if}
		</CardContent>
	</Card>
</div>
