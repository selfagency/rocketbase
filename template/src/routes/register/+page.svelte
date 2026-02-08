<script lang="ts">
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

	const registerSchema = z
		.object({
			email: z.email(m['validation.email_invalid']()),
			password: z.string().min(8, m['validation.password_min_length']()),
			passwordConfirm: z.string(),
			name: z.string().min(2, m['validation.name_min_length']())
		})
		.refine((data) => data.password === data.passwordConfirm, {
			message: m['validation.passwords_no_match'](),
			path: ['passwordConfirm']
		});

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	const superFormObj = superForm(data.form, {
		validators: zod4Client(registerSchema)
	});

	const { form, enhance } = superFormObj;
</script>

<div class="flex min-h-screen items-center justify-center px-4">
	<Card class="w-full max-w-md">
		<CardHeader>
			<CardTitle>{m['auth.register.title']()}</CardTitle>
			<CardDescription>{m['auth.register.description']()}</CardDescription>
		</CardHeader>
		<CardContent>
			<form method="POST" use:enhance class="space-y-4">
				<FormField form={superFormObj} name="name">
					<FormControl>
						{#snippet children({ props })}
							<FormLabel>{m['auth.register.name_label']()}</FormLabel>
							<Input
								{...props}
								bind:value={$form.name}
								type="text"
								placeholder={m['auth.register.name_placeholder']()}
							/>
						{/snippet}
					</FormControl>
					<FormFieldErrors />
				</FormField>

				<FormField form={superFormObj} name="email">
					<FormControl>
						{#snippet children({ props })}
							<FormLabel>{m['auth.register.email_label']()}</FormLabel>
							<Input
								{...props}
								bind:value={$form.email}
								type="email"
								placeholder={m['auth.register.email_placeholder']()}
							/>
						{/snippet}
					</FormControl>
					<FormFieldErrors />
				</FormField>

				<FormField form={superFormObj} name="password">
					<FormControl>
						{#snippet children({ props })}
							<FormLabel>{m['auth.register.password_label']()}</FormLabel>
							<Input
								{...props}
								bind:value={$form.password}
								type="password"
								placeholder={m['auth.register.password_placeholder']()}
							/>
						{/snippet}
					</FormControl>
					<FormFieldErrors />
				</FormField>

				<FormField form={superFormObj} name="passwordConfirm">
					<FormControl>
						{#snippet children({ props })}
							<FormLabel>{m['auth.register.password_confirm_label']()}</FormLabel>
							<Input
								{...props}
								bind:value={$form.passwordConfirm}
								type="password"
								placeholder={m['auth.register.password_confirm_placeholder']()}
							/>
						{/snippet}
					</FormControl>
					<FormFieldErrors />
				</FormField>

				<div class="text-sm">
					{m['auth.register.login_link_text']()}
					<a href="/login" class="text-primary hover:underline">{m['auth.register.login_link']()}</a
					>
				</div>

				<Button type="submit" class="w-full">{m['auth.register.submit_button']()}</Button>
			</form>
		</CardContent>
	</Card>
</div>
