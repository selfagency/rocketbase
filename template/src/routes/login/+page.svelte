<script lang="ts">
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
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
	import * as m from '$lib/paraglide/messages';
	import { AlertCircle } from '@lucide/svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';

	const loginSchema = z.object({
		email: z.email(m['validation.email_invalid']()),
		password: z.string().min(8, m['validation.password_min_length']())
	});

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	const {
		form: formData,
		enhance,
		errors,
		message
	} = superForm(data.form, {
		validators: zod4Client(loginSchema)
	});

	let showMfaForm = $state(false);
	let mfaData = $state({ mfaId: '', otpId: '', email: '' });
	let mfaCode = $state('');

	$effect(() => {
		if ((data as any).mfaRequired) {
			showMfaForm = true;
			mfaData = {
				mfaId: (data as any).mfaId || '',
				otpId: (data as any).otpId || '',
				email: (data as any).email || ''
			};
		}
	});
</script>

<div class="flex min-h-screen items-center justify-center px-4">
	<Card class="w-full max-w-md">
		<CardHeader>
			<CardTitle>{m['auth.login.title']()}</CardTitle>
			<CardDescription>
				{#if showMfaForm}
					Enter the verification code sent to your email
				{:else}
					{m['auth.login.description']()}
				{/if}
			</CardDescription>
		</CardHeader>
		<CardContent>
			{#if showMfaForm}
				<!-- MFA Verification Form -->
				<form method="POST" action="?/verifyMfa" class="space-y-4">
					<input type="hidden" name="mfaId" value={mfaData.mfaId} />
					<input type="hidden" name="otpId" value={mfaData.otpId} />
					<input type="hidden" name="email" value={mfaData.email} />

					<div class="space-y-2">
						<Label for="code">Verification Code</Label>
						<Input
							id="code"
							name="code"
							type="text"
							placeholder="Enter 6-digit code"
							bind:value={mfaCode}
							maxlength={6}
							required
						/>
					</div>

					<Button type="submit" class="w-full">Verify Code</Button>
					<Button
						type="button"
						variant="outline"
						class="w-full"
						onclick={() => window.location.reload()}
					>
						Back to Login
					</Button>
				</form>
			{:else}
				<!-- Standard Login Form -->
				<form method="POST" action="?/login" use:enhance class="space-y-4">
					{#if $message}
						<Alert variant="destructive">
							<AlertCircle class="h-4 w-4" />
							<AlertDescription>{$message}</AlertDescription>
						</Alert>
					{/if}
					<div class="space-y-2">
						<Label for="email">{m['auth.login.email_label']()}</Label>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder={m['auth.login.email_placeholder']()}
							bind:value={$formData.email}
							aria-invalid={$errors.email ? 'true' : undefined}
						/>
						{#if $errors.email}
							<p class="text-sm text-destructive">
								{$errors.email}
							</p>
						{/if}
					</div>

					<div class="space-y-2">
						<Label for="password">{m['auth.login.password_label']()}</Label>
						<Input
							id="password"
							name="password"
							type="password"
							placeholder={m['auth.login.password_placeholder']()}
							bind:value={$formData.password}
							aria-invalid={$errors.password ? 'true' : undefined}
						/>
						{#if $errors.password}
							<p class="text-sm text-destructive">
								{$errors.password}
							</p>
						{/if}
					</div>

					<div class="flex items-center justify-between text-sm">
						<a href="/register" class="text-primary hover:underline"
							>{m['auth.login.create_account_link']()}</a
						>
						<a href="/forgot-password" class="text-primary hover:underline"
							>{m['auth.login.forgot_password_link']()}</a
						>
					</div>

					<Button type="submit" class="w-full">{m['auth.login.submit_button']()}</Button>
				</form>
			{/if}
		</CardContent>
	</Card>
</div>
