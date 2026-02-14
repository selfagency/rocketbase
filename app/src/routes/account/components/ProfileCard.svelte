<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as m from '$lib/paraglide/messages.js';
	import { toast } from '$lib/stores/toast';
	import {
		getDisplayName,
		getPocketBaseAvatarUrl,
		getUserInitials
	} from '$lib/utils/user-profile';

	let {
		user,
		superFormObj,
		form,
		profileEnhance,
		profileMessage,
		onAvatarSelected
	}: {
		user: any;
		superFormObj: any;
		form: any;
		profileEnhance: any;
		profileMessage: any;
		onAvatarSelected?: () => void;
	} = $props();

	let avatarPreview = $state<string | null>(null);
	let verificationEmailSent = $state(false);

	function handleAvatarChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			$form.avatar = file;
			onAvatarSelected?.();
			const reader = new FileReader();
			reader.onload = (event) => {
				avatarPreview = event.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	async function handleSendVerificationEmail() {
		const formData = new FormData();
		const response = await fetch('?/sendVerificationEmail', {
			method: 'POST',
			body: formData
		});

		if (response.ok) {
			verificationEmailSent = true;
			toast(m['account.email_verification_sent'](), 'success');
		} else {
			let errorMessage = m['account.email_verification_failed']();
			try {
				const data = (await response.json()) as { message?: string } | null;
				if (data?.message) errorMessage = data.message;
			} catch {
				// Ignore JSON parsing failures.
			}
			toast(errorMessage, 'error');
		}
	}
</script>

<Card class="mb-8">
	<CardHeader class="flex flex-row items-center justify-between">
		<CardTitle>{m['account.profile_section']()}</CardTitle>
		<Badge variant="secondary" class="capitalize">{user.role}</Badge>
	</CardHeader>
	<CardContent>
		<form method="POST" action="?/updateProfile" use:profileEnhance enctype="multipart/form-data">
			<div class="space-y-4">
				{#if $profileMessage}
					<Alert variant="destructive">
						<AlertTitle>{m['common.error_title']()}</AlertTitle>
						<AlertDescription>{$profileMessage}</AlertDescription>
					</Alert>
				{/if}

				<div class="space-y-2">
					<Label>{m['account.avatar_label']()}</Label>
					<div class="flex items-start gap-4">
						<div>
							<Avatar.Root class="z-0 h-24 w-24 rounded-lg">
								{#if avatarPreview}
									<Avatar.Image src={avatarPreview} alt={m['account.avatar_preview_alt']()} />
								{:else if user.avatar}
									<Avatar.Image
										src={getPocketBaseAvatarUrl(user, env.PUBLIC_POCKETBASE_URL) || undefined}
										alt={getDisplayName(user, m['common.user_fallback']())}
									/>
								{/if}
								<Avatar.Fallback>{getUserInitials(user, m['common.user_fallback']())}</Avatar.Fallback>
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
								{m['account.avatar_upload_button']()}
							</Button>
							{#if avatarPreview || user.avatar}
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onclick={() => {
										avatarPreview = null;
										$form.avatar = undefined;
									}}
								>
									{m['account.avatar_remove_button']()}
								</Button>
							{/if}
						</div>
					</div>
				</div>

				<Form.Field form={superFormObj} name="name">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>{m['account.name_label']()}</Form.Label>
							<Input {...props} bind:value={$form.name} type="text" required />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<div>
					<Form.Field form={superFormObj} name="email">
						<Form.Control>
							{#snippet children({ props })}
								<div class="flex items-center gap-2">
									<Form.Label>{m['account.email_label']()}</Form.Label>
									{#if user.verified}
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
					{#if !user.verified}
						{#if verificationEmailSent}
							<div class="mt-3 rounded-md bg-amber-50 p-3" data-testid="email-verification-sent">
								<p class="text-sm text-amber-800">
									{m['account.email_verification_sent_help']()}
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

				<Form.Field form={superFormObj} name="title">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>{m['account.title_label']()}</Form.Label>
							<Input {...props} bind:value={$form.title} type="text" />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field form={superFormObj} name="bio">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>{m['account.bio_label']()}</Form.Label>
							<Textarea {...props} bind:value={$form.bio} rows={4} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field form={superFormObj} name="website">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>{m['account.website_label']()}</Form.Label>
							<Input
								{...props}
								bind:value={$form.website}
								type="url"
								placeholder={m['account.website_placeholder']()}
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
