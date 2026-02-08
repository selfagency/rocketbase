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
	import { FormControl, FormField, FormFieldErrors, FormLabel } from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import * as m from '$lib/paraglide/messages';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';

	const forgotPasswordSchema = z.object({
		email: z.email(m['validation.email_invalid']())
	});

	let { data, form: actionData } = $props();

	// svelte-ignore state_referenced_locally
	const superFormObj = superForm(data.form, {
		validators: zod4Client(forgotPasswordSchema)
	});

	const { form, enhance } = superFormObj;

	// svelte-ignore state_referenced_locally
	let showSuccess = $state(actionData?.success);

	$effect(() => {
		showSuccess = actionData?.success;
	});
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
				<FormField form={superFormObj} name="email">
					<FormControl>
						{#snippet children({ props })}
							<FormLabel>{m['auth.forgot_password.email_label']()}</FormLabel>
							<Input
								{...props}
								bind:value={$form.email}
								type="email"
								placeholder={m['auth.forgot_password.email_placeholder']()}
							/>
						{/snippet}
					</FormControl>
					<FormFieldErrors />
				</FormField>

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
