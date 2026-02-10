<script lang="ts">
	import { page } from '$app/state';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
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
	import * as m from '$lib/paraglide/messages';
	import { toast } from '$lib/stores/toast';
	import { CircleAlert } from '@lucide/svelte';
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

	/** @type {import('./$types').Snapshot<string>} */
	export const snapshot = {
		capture: () => $form.email,
		restore: (value) => ($form.email = value)
	};

	let showMfaForm = $state(false);
	let mfaData = $state({ mfaId: '', otpId: '', email: '' });
	let mfaCode = $state('');

	// Show success toast if coming from registration
	$effect(() => {
		if (page.url.searchParams.get('registered') === 'true') {
			toast(m['auth.register.success'](), 'success');
			// Clean up URL without reload
			window.history.replaceState({}, '', '/login');
		}
	});

	// Watch for MFA data from action result
	$effect(() => {
		const actionResult = page.form as any;
		if (actionResult?.mfaRequired && !showMfaForm) {
			showMfaForm = true;
			mfaData = {
				mfaId: actionResult.mfaId || '',
				otpId: actionResult.otpId || '',
				email: actionResult.email || ''
			};
			mfaCode = ''; // Clear code field
		}
	});
</script>

<div class="flex min-h-[80vh] items-center justify-center px-4">
	<Card class="w-full max-w-md">
		<CardHeader>
			<CardTitle>{m['auth.login.title']()}</CardTitle>
			<CardDescription>
				{#if showMfaForm}
					{m['auth.login.mfa_description']()}
				{:else}
					{m['auth.login.description']()}
				{/if}
			</CardDescription>
		</CardHeader>
		<CardContent>
			{#if showMfaForm}
				<!-- MFA Verification Form -->
				<form
					method="POST"
					action="?/verifyMfa"
					class="space-y-4"
					data-testid="mfa-verification-form"
				>
					{#if page.form?.message}
						<Alert variant="destructive" data-testid="mfa-error-alert">
							<CircleAlert class="h-4 w-4" />
							<AlertDescription>{page.form.message}</AlertDescription>
						</Alert>
					{/if}

					<input type="hidden" name="mfaId" value={mfaData.mfaId} />
					<input type="hidden" name="otpId" value={mfaData.otpId} data-testid="mfa-otp-id" />
					<input type="hidden" name="email" value={mfaData.email} data-testid="mfa-email" />

					<div class="space-y-2">
						<Label for="code">{m['auth.login.mfa_code_label']()}</Label>
						<Input
							id="code"
							name="code"
							type="text"
							placeholder={m['auth.login.mfa_code_placeholder']()}
							bind:value={mfaCode}
							maxlength={8}
							required
							data-testid="mfa-code-input"
						/>
					</div>

					<Button type="submit" class="w-full" data-testid="mfa-verify-button">
						{m['auth.login.mfa_verify_button']()}
					</Button>
					<Button
						type="button"
						variant="outline"
						class="w-full"
						onclick={() => {
							showMfaForm = false;
							mfaCode = '';
							mfaData = { mfaId: '', otpId: '', email: '' };
						}}
					>
						{m['auth.login.mfa_back_button']()}
					</Button>
				</form>
			{:else}
				<!-- Standard Login Form -->
				<form method="POST" action="?/login" use:enhance class="space-y-4">
					{#if $message}
						<Alert variant="destructive">
							<CircleAlert class="h-4 w-4" />
							<AlertDescription>{$message}</AlertDescription>
						</Alert>
					{/if}
					<Form.Field form={superFormObj} name="email">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>{m['auth.login.email_label']()}</Form.Label>
								<Input
									{...props}
									bind:value={$form.email}
									type="email"
									placeholder={m['auth.login.email_placeholder']()}
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field form={superFormObj} name="password">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>{m['auth.login.password_label']()}</Form.Label>
								<Input
									{...props}
									bind:value={$form.password}
									type="password"
									placeholder={m['auth.login.password_placeholder']()}
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

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
