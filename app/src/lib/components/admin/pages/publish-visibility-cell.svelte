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
    <span
      class="inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-[11px] font-medium text-green-800"
      aria-label="Published"
    >
      Published
    </span>
  {:else}
    <span
      class="inline-flex items-center rounded-full bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-800"
      aria-label="Draft"
    >
      Draft
    </span>
  {/if}

  {#if !visible}
    <EyeOffIcon class="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
    <span class="sr-only">Hidden</span>
  {/if}
</div>
