<script lang="ts">
  import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import * as m from '$lib/paraglide/messages';
  import { superForm } from 'sveltekit-superforms';
  import { zod4Client } from 'sveltekit-superforms/adapters';
  import { z } from 'zod';

  const forgotPasswordSchema = z.object({
    email: z.email(m['validation.email_invalid']())
  });

  let { data, form: actionData } = $props();

  const form = $derived.by(() =>
    superForm(data.form, {
      validators: zod4Client(forgotPasswordSchema)
    })
  );

  const { form: formData, enhance, errors } = $derived(form);
  const showSuccess = $derived(actionData?.success);
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
        <div class="space-y-2">
          <Label for="email">{m['auth.forgot_password.email_label']()}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={m['auth.forgot_password.email_placeholder']()}
            bind:value={$formData.email}
            aria-invalid={$errors.email ? 'true' : undefined}
          />
          {#if $errors.email}
            <p class="text-sm text-destructive">{$errors.email}</p>
          {/if}
        </div>

        <div class="text-sm">
          {m['auth.forgot_password.login_link_text']()}
          <a href="/login" class="text-primary hover:underline">{m['auth.forgot_password.login_link']()}</a>
        </div>

        <Button type="submit" class="w-full">{m['auth.forgot_password.submit_button']()}</Button>
      </form>
    </CardContent>
  </Card>
</div>
