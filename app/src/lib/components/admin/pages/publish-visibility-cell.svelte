<script lang="ts">
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
    <span class="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
      Published
    </span>
  {:else}
    <span class="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
      Draft
    </span>
  {/if}

  {#if !visible}
    <EyeOffIcon class="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
    <span class="sr-only">Hidden</span>
  {/if}
</div>
