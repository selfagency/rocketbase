<script lang="ts">
  import { registerSchema } from '$lib/auth/schemas';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import * as Form from '$lib/components/ui/form';
  import { Input } from '$lib/components/ui/input';
  import * as m from '$lib/paraglide/messages';
  import { CircleAlert } from '@lucide/svelte';
  import { MetaTags } from 'svelte-meta-tags';
  import { superForm } from 'sveltekit-superforms';
  import { zod4Client } from 'sveltekit-superforms/adapters';

  const metaTags = {
    title: 'Register',
    description: 'Create a new account',
    openGraph: {
      title: 'Register',
      description: 'Create a new account',
    },
  };

  let { data } = $props();

  // svelte-ignore state_referenced_locally
  const superFormObj = superForm(data.form, {
    validators: zod4Client(registerSchema),
  });

  const { form, enhance, message, capture, restore } = superFormObj;

  // Use Superforms snapshot support for browser navigation state preservation
  export const snapshot = { capture, restore };
</script>

<MetaTags {...metaTags} />

<div class="flex min-h-screen items-center justify-center px-4">
  <Card class="w-full max-w-md">
    <CardHeader>
      <CardTitle>{m['auth.register.title']()}</CardTitle>
      <CardDescription>{m['auth.register.description']()}</CardDescription>
    </CardHeader>
    <CardContent>
      <form method="POST" action="?/register" use:enhance class="space-y-4">
        {#if $message}
          <Alert variant="destructive">
            <CircleAlert class="h-4 w-4" />
            <AlertDescription>{$message}</AlertDescription>
          </Alert>
        {/if}

        <Form.Field form={superFormObj} name="name">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>{m['auth.register.name_label']()}</Form.Label>
              <Input
                {...props}
                bind:value={$form.name}
                type="text"
                placeholder={m['auth.register.name_placeholder']()}
              />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <Form.Field form={superFormObj} name="email">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>{m['auth.register.email_label']()}</Form.Label>
              <Input
                {...props}
                bind:value={$form.email}
                type="email"
                placeholder={m['auth.register.email_placeholder']()}
              />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <Form.Field form={superFormObj} name="password">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>{m['auth.register.password_label']()}</Form.Label>
              <Input
                {...props}
                bind:value={$form.password}
                type="password"
                placeholder={m['auth.register.password_placeholder']()}
              />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <Form.Field form={superFormObj} name="passwordConfirm">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>{m['auth.register.password_confirm_label']()}</Form.Label>
              <Input
                {...props}
                bind:value={$form.passwordConfirm}
                type="password"
                placeholder={m['auth.register.password_confirm_placeholder']()}
              />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <div class="text-sm">
          {m['auth.register.login_link_text']()}
          <a href="/login" class="text-primary hover:underline">{m['auth.register.login_link']()}</a>
        </div>

        <Button type="submit" class="w-full">{m['auth.register.submit_button']()}</Button>
      </form>
    </CardContent>
  </Card>
</div>
