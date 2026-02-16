<script lang="ts">
  import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import * as Form from '$lib/components/ui/form';
  import { Input } from '$lib/components/ui/input';
  import * as m from '$lib/paraglide/messages';

  let {
    passwordFormObj,
    passwordForm,
    passwordEnhance,
    passwordMessage,
  }: {
    passwordFormObj: any;
    passwordForm: any;
    passwordEnhance: any;
    passwordMessage: any;
  } = $props();
</script>

<Card class="surface-enter">
  <CardHeader>
    <CardTitle>{m['account.password_section']()}</CardTitle>
  </CardHeader>
  <CardContent>
    <Alert class="surface-enter mb-4">
      <AlertTitle>{m['common.warning_title']()}</AlertTitle>
      <AlertDescription>{m['account.password_warning']()}</AlertDescription>
    </Alert>
    <form method="POST" action="?/changePassword" use:passwordEnhance>
      <div class="space-y-4">
        {#if $passwordMessage}
          <Alert variant="destructive">
            <AlertTitle>{m['common.error_title']()}</AlertTitle>
            <AlertDescription>{$passwordMessage}</AlertDescription>
          </Alert>
        {/if}

        <Form.Field form={passwordFormObj} name="oldPassword">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>{m['account.current_password_label']()}</Form.Label>
              <Input {...props} bind:value={$passwordForm.oldPassword} type="password" required />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <Form.Field form={passwordFormObj} name="password">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>{m['account.new_password_label']()}</Form.Label>
              <Input {...props} bind:value={$passwordForm.password} type="password" required />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <Form.Field form={passwordFormObj} name="passwordConfirm">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>{m['account.confirm_password_label']()}</Form.Label>
              <Input {...props} bind:value={$passwordForm.passwordConfirm} type="password" required />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <Button type="submit">{m['account.change_password_button']()}</Button>
      </div>
    </form>
  </CardContent>
</Card>
