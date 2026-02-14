<script lang="ts">
  import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import * as Form from '$lib/components/ui/form';
  import { Label } from '$lib/components/ui/label';
  import { Switch } from '$lib/components/ui/switch';
  import * as m from '$lib/paraglide/messages.js';

  let {
    mfaRequired,
    mfaFormObj,
    mfaForm,
    mfaEnhance,
  }: {
    mfaRequired: boolean;
    mfaFormObj: any;
    mfaForm: any;
    mfaEnhance: any;
  } = $props();

  let mfaFormElement: HTMLFormElement | undefined = $state();
  let previousMfaOptIn = $state($mfaForm.mfaOptIn);

  $effect(() => {
    const current = $mfaForm.mfaOptIn;
    if (current !== previousMfaOptIn) {
      mfaFormElement?.requestSubmit();
    }
    previousMfaOptIn = current;
  });
</script>

<Card class="mb-8">
  <CardHeader>
    <CardTitle>{m['account.2fa_title']()}</CardTitle>
    <CardDescription>{m['account.2fa_description']()}</CardDescription>
  </CardHeader>
  <CardContent>
    {#if mfaRequired}
      <Alert>
        <AlertTitle>{m['account.2fa_required_title']()}</AlertTitle>
        <AlertDescription>{m['account.2fa_required_info']()}</AlertDescription>
      </Alert>
    {:else}
      <Alert>
        <AlertTitle>
          {$mfaForm.mfaOptIn ? m['account.2fa_enabled_title']() : m['account.2fa_not_required_title']()}
        </AlertTitle>
        <AlertDescription>
          {$mfaForm.mfaOptIn ? m['account.2fa_opted_in_info']() : m['account.2fa_opt_in_info']()}
        </AlertDescription>
      </Alert>
      <form bind:this={mfaFormElement} method="POST" action="?/toggleMfaOptIn" use:mfaEnhance class="mt-4">
        <Form.Field form={mfaFormObj} name="mfaOptIn">
          <Form.Control>
            {#snippet children({ props: _props })}
              <div class="flex items-center gap-3">
                <Switch {..._props} id="mfa-opt-in" bind:checked={$mfaForm.mfaOptIn} />
                <Label for="mfa-opt-in">
                  {$mfaForm.mfaOptIn ? m['account.2fa_disable_button']() : m['account.2fa_enable_button']()}
                </Label>
              </div>
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
      </form>
    {/if}
  </CardContent>
</Card>
