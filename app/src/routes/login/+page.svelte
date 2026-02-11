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
	import * as m from '$lib/paraglide/messages.js';
	import { toast } from '$lib/stores/toast';
	import { CircleAlert } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';

	const loginSchema = z.object({
		email: z.string().optional(),
		password: z.string().optional(),
		code: z.string().optional(),
		mfaId: z.string().optional(),
		otpId: z.string().optional()
	});

	const { data } = $props();

	// svelte-ignore state_referenced_locally
	const superFormObj = superForm(data.form, {
		validators: zod4Client(loginSchema)
	});

	const { form, enhance, message } = superFormObj;

	// Wrap enhance to log submissions for debugging (Playwright captures console)
	// function enhanceWithLogging(node: HTMLFormElement) {
	// 	console.log('enhanceWithLogging: attaching enhance to form', node.action, node.method);
	// 	// Log submit details (non-sensitive: email only) to help e2e debugging
	// 	const submitListener = (ev: Event) => {
	// 		try {
	// 			const emailInput = node.querySelector('input[name="email"]') as HTMLInputElement | null;
	// 			const emailVal = emailInput?.value || '<empty>';
	// 			console.log('form submit:', node.action, 'method:', node.method, 'email:', emailVal);
	// 		} catch (err) {
	// 			console.log('form submit: could not read email', err);
	// 		}
	// 	};
	// 	node.addEventListener('submit', submitListener);

	// 	const result = enhance(node as HTMLFormElement);

	// 	// Return a cleanup function
	// 	return () => {
	// 		try {
	// 			node.removeEventListener('submit', submitListener);
	// 		} catch (e) {
	// 			/* ignore */
	// 		}
	// 		if (result && typeof result === 'object' && typeof (result as any).destroy === 'function') {
	// 			(result as any).destroy();
	// 		}
	// 	};
	// }

	// Show MFA code input if both mfaId and otpId are present in form data
	const showMfaInput = $derived.by(() => {
		return Boolean($form.mfaId && $form.otpId);
	});

	onMount(() => {
		if (page.url.searchParams.get('registered') === 'true') {
			toast(m['auth.register.success'](), 'success');
		}
	});
</script>

<div class="flex min-h-[86vh] items-center justify-center bg-muted/50">
	<Card class="w-full max-w-md">
		<CardHeader class="space-y-1">
			<CardTitle class="text-2xl">{m['auth.login.title']()}</CardTitle>
			<CardDescription>{m['auth.login.description']()}</CardDescription>
		</CardHeader>
		<CardContent>
			<form method="POST" action="?/login" use:enhance class="space-y-4">
				{#if $message}
					<Alert variant="destructive" role="alert">
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
								class={showMfaInput ? 'pointer-events-none opacity-80' : ''}
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
								class={showMfaInput ? 'pointer-events-none opacity-80' : ''}
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<!-- MFA Code Input - conditionally shown -->
				{#if showMfaInput}
					<div class="rounded-md bg-blue-50 p-3">
						<p class="mb-3 text-sm text-blue-800">
							{m['auth.mfa_code_hint']?.() || 'Check your email for a verification code'}
						</p>

						<Form.Field form={superFormObj} name="code">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>{m['auth.login.mfa_code_label']()}</Form.Label>
									<Input
										{...props}
										bind:value={$form.code}
										type="text"
										placeholder={m['auth.login.mfa_code_placeholder']()}
										maxlength={8}
										data-testid="mfa-code-input"
									/>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>
				{/if}

				{#if showMfaInput}
					<Button type="submit" class="w-full" data-testid="mfa-verify-button">
						{m['auth.login.mfa_verify_button']?.() || 'Verify Code'}
					</Button>
					<!-- Hidden fields for MFA session data -->
					<input type="hidden" name="mfaId" value={$form.mfaId || ''} />
					<input type="hidden" name="otpId" value={$form.otpId || ''} />
				{:else}
					<div class="flex items-center justify-between text-sm">
						<a href="/register" class="text-primary hover:underline">
							{m['auth.login.create_account_link']()}
						</a>
						<a href="/forgot-password" class="text-primary hover:underline">
							{m['auth.login.forgot_password_link']()}
						</a>
					</div>

					<Button type="submit" class="w-full">{m['auth.login.submit_button']()}</Button>
				{/if}
			</form>
		</CardContent>
	</Card>
</div>
