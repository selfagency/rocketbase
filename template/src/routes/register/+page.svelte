<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
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

  const form = $derived.by(() =>
    superForm(data.form, {
      validators: zod4Client(registerSchema)
    })
  );

  const { form: formData, enhance, errors } = $derived(form);
</script>

<div class="flex min-h-screen items-center justify-center px-4">
  <Card class="w-full max-w-md">
    <CardHeader>
      <CardTitle>{m['auth.register.title']()}</CardTitle>
      <CardDescription>{m['auth.register.description']()}</CardDescription>
    </CardHeader>
    <CardContent>
      <form method="POST" use:enhance class="space-y-4">
        <div class="space-y-2">
          <Label for="name">{m['auth.register.name_label']()}</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder={m['auth.register.name_placeholder']()}
            bind:value={$formData.name}
            aria-invalid={$errors.name ? 'true' : undefined}
          />
          {#if $errors.name}
            <p class="text-sm text-destructive">{$errors.name}</p>
          {/if}
        </div>

        <div class="space-y-2">
          <Label for="email">{m['auth.register.email_label']()}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={m['auth.register.email_placeholder']()}
            bind:value={$formData.email}
            aria-invalid={$errors.email ? 'true' : undefined}
          />
          {#if $errors.email}
            <p class="text-sm text-destructive">{$errors.email}</p>
          {/if}
        </div>

        <div class="space-y-2">
          <Label for="password">{m['auth.register.password_label']()}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder={m['auth.register.password_placeholder']()}
            bind:value={$formData.password}
            aria-invalid={$errors.password ? 'true' : undefined}
          />
          {#if $errors.password}
            <p class="text-sm text-destructive">{$errors.password}</p>
          {/if}
        </div>

        <div class="space-y-2">
          <Label for="passwordConfirm">{m['auth.register.password_confirm_label']()}</Label>
          <Input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            placeholder={m['auth.register.password_confirm_placeholder']()}
            bind:value={$formData.passwordConfirm}
            aria-invalid={$errors.passwordConfirm ? 'true' : undefined}
          />
          {#if $errors.passwordConfirm}
            <p class="text-sm text-destructive">{$errors.passwordConfirm}</p>
          {/if}
        </div>

        <div class="text-sm">
          {m['auth.register.login_link_text']()}
          <a href="/login" class="text-primary hover:underline">{m['auth.register.login_link']()}</a>
        </div>

        <Button type="submit" class="w-full">{m['auth.register.submit_button']()}</Button>
      </form>
    </CardContent>
  </Card>
</div>
