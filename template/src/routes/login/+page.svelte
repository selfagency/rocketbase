<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import * as m from '$lib/paraglide/messages';
  import { superForm } from 'sveltekit-superforms';
  import { zod4Client } from 'sveltekit-superforms/adapters';
  import { z } from 'zod';

  const loginSchema = z.object({
    email: z.email(m['validation.email_invalid']()),
    password: z.string().min(8, m['validation.password_min_length']())
  });

  let { data } = $props();

  const form = $derived.by(() =>
    superForm(data.form, {
      validators: zod4Client(loginSchema)
    })
  );

  const { form: formData, enhance, errors } = $derived(form);
</script>

<div class="flex min-h-screen items-center justify-center px-4">
  <Card class="w-full max-w-md">
    <CardHeader>
      <CardTitle>{m['auth.login.title']()}</CardTitle>
      <CardDescription>{m['auth.login.description']()}</CardDescription>
    </CardHeader>
    <CardContent>
      <form method="POST" use:enhance class="space-y-4">
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
            <p class="text-sm text-destructive">{$errors.email}</p>
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
            <p class="text-sm text-destructive">{$errors.password}</p>
          {/if}
        </div>

        <div class="flex items-center justify-between text-sm">
          <a href="/register" class="text-primary hover:underline">{m['auth.login.create_account_link']()}</a>
          <a href="/forgot-password" class="text-primary hover:underline">{m['auth.login.forgot_password_link']()}</a>
        </div>

        <Button type="submit" class="w-full">{m['auth.login.submit_button']()}</Button>
      </form>
    </CardContent>
  </Card>
</div>
