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
	import { FormControl, FormField, FormFieldErrors, FormLabel } from '$lib/components/ui/form';
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
	const superFormObj = superForm(data.form, {
		validators: zod4Client(loginSchema)
	});

	const { form, enhance, message } = superFormObj;

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
					<FormField form={superFormObj} name="email">
						<FormControl>
							{#snippet children({ props })}
								<FormLabel>{m['auth.login.email_label']()}</FormLabel>
								<Input
									{...props}
									bind:value={$form.email}
									type="email"
									placeholder={m['auth.login.email_placeholder']()}
								/>
							{/snippet}
						</FormControl>
						<FormFieldErrors />
					</FormField>

					<FormField form={superFormObj} name="password">
						<FormControl>
							{#snippet children({ props })}
								<FormLabel>{m['auth.login.password_label']()}</FormLabel>
								<Input
									{...props}
									bind:value={$form.password}
									type="password"
									placeholder={m['auth.login.password_placeholder']()}
								/>
							{/snippet}
						</FormControl>
						<FormFieldErrors />
					</FormField>

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
