<script lang="ts">
  import StatusIndicator from '$lib/components/admin/status-indicator.svelte';
  import EyeOffIcon from '@lucide/svelte/icons/eye-off';

  let {
    published = false,
    visible = false,
  }: {
    published?: boolean;
    visible?: boolean;
  } = $props();
</script>

<div class="inline-flex items-center gap-1.5">
  {#if published}
    <StatusIndicator label="Published" tone="published" />
  {:else}
    <StatusIndicator label="Draft" tone="draft" />
  {/if}

  {#if !visible}
    <EyeOffIcon class="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
    <span class="sr-only">Hidden</span>
  {/if}
</div>
