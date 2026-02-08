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
	import { FormControl, FormField, FormFieldErrors, FormLabel } from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
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

	let avatarPreview = $state<string | null>(null);

	// svelte-ignore state_referenced_locally
	const superFormObj = superForm(data.profileForm, {
		validators: zod4Client(profileSchema),
		resetForm: false,
		onUpdated: ({ form }) => {
			if (form.valid) {
				avatarPreview = null;
			}
		}
	});

	const { form, enhance: profileEnhance, message: profileMessage } = superFormObj;

	let savedMfaOptIn = $state(false);
	let uiMfaOptIn = $state(false);
	let mfaPending = $state(false);
	let mfaMessage = $state<string | null>(null);
	let mfaFormRef = $state<HTMLFormElement | null>(null);

	$effect(() => {
		savedMfaOptIn = Boolean(data.mfaOptIn);
		uiMfaOptIn = savedMfaOptIn;
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
					{#if $profileMessage}
						<Alert variant="destructive">
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>{$profileMessage}</AlertDescription>
						</Alert>
					{/if}
					<!-- Avatar -->
					<FormField form={superFormObj} name="avatar">
						{#snippet children({ constraints, errors, tainted, value })}
							<div class="space-y-2">
								<FormLabel>{m['account.avatar_label']()}</FormLabel>
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
								<FormControl>
									{#snippet children({ props })}
										<Input {...props} type="file" accept="image/*" onchange={handleAvatarChange} />
									{/snippet}
								</FormControl>
								<FormFieldErrors />
							</div>
						{/snippet}
					</FormField>

					<!-- Name -->
					<FormField form={superFormObj} name="name">
						<FormControl>
							{#snippet children({ props })}
								<FormLabel>{m['account.name_label']()}</FormLabel>
								<Input {...props} bind:value={$form.name} type="text" required />
							{/snippet}
						</FormControl>
						<FormFieldErrors />
					</FormField>

					<!-- Email -->
					<FormField form={superFormObj} name="email">
						<FormControl>
							{#snippet children({ props })}
								<FormLabel>{m['account.email_label']()}</FormLabel>
								<Input {...props} bind:value={$form.email} type="email" required />
							{/snippet}
						</FormControl>
						<FormFieldErrors />
					</FormField>

					<!-- Title -->
					<FormField form={superFormObj} name="title">
						<FormControl>
							{#snippet children({ props })}
								<FormLabel>{m['account.title_label']()}</FormLabel>
								<Input {...props} bind:value={$form.title} type="text" />
							{/snippet}
						</FormControl>
						<FormFieldErrors />
					</FormField>

					<!-- Bio -->
					<FormField form={superFormObj} name="bio">
						<FormControl>
							{#snippet children({ props })}
								<FormLabel>{m['account.bio_label']()}</FormLabel>
								<Textarea {...props} bind:value={$form.bio} rows={4} />
							{/snippet}
						</FormControl>
						<FormFieldErrors />
					</FormField>

					<!-- Website -->
					<FormField form={superFormObj} name="website">
						<FormControl>
							{#snippet children({ props })}
								<FormLabel>{m['account.website_label']()}</FormLabel>
								<Input
									{...props}
									bind:value={$form.website}
									type="url"
									placeholder="https://example.com"
								/>
							{/snippet}
						</FormControl>
						<FormFieldErrors />
					</FormField>

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
</div>
