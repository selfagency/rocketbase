<script lang="ts">
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
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
	import * as m from '$lib/paraglide/messages';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';

	const forgotPasswordSchema = z.object({
		email: z.email(m['validation.email_invalid']())
	});

	let { data, form: actionData } = $props();

	let showSuccess = $state(false);

	// svelte-ignore state_referenced_locally
	const superFormObj = superForm(data.form, {
		validators: zod4Client(forgotPasswordSchema),
		onUpdate({ form, result }) {
			if (form.valid) {
				const resultData = result.data as any;
				if (resultData?.success) {
					showSuccess = true;
				}
			}
		}
	});

	const { form, enhance, capture, restore } = superFormObj;

	// Use Superforms snapshot support for browser navigation state preservation
	export const snapshot = { capture, restore };
</script>

<div class="flex min-h-screen items-center justify-center px-4">
	<Card class="w-full max-w-md">
		<CardHeader>
			<CardTitle>{m['auth.forgot_password.title']()}</CardTitle>
			<CardDescription>{m['auth.forgot_password.description']()}</CardDescription>
		</CardHeader>
		<CardContent>
			{#if showSuccess}
				<Alert class="mb-4">
					<AlertTitle>{m['auth.forgot_password.success_title']()}</AlertTitle>
					<AlertDescription>
						{actionData?.message}
					</AlertDescription>
				</Alert>
			{/if}

			<form method="POST" use:enhance class="space-y-4">
				<Form.Field form={superFormObj} name="email">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>{m['auth.forgot_password.email_label']()}</Form.Label>
							<Input
								{...props}
								bind:value={$form.email}
								type="email"
								placeholder={m['auth.forgot_password.email_placeholder']()}
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<div class="text-sm">
					{m['auth.forgot_password.login_link_text']()}
					<a href="/login" class="text-primary hover:underline"
						>{m['auth.forgot_password.login_link']()}</a
					>
				</div>

				<Button type="submit" class="w-full">{m['auth.forgot_password.submit_button']()}</Button>
			</form>
		</CardContent>
	</Card>
</div>
