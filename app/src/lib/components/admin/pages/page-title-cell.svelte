<script lang="ts">
  import CornerDownRightIcon from '@lucide/svelte/icons/corner-down-right';

  let {
    title,
    id,
    depth = 0,
  }: {
    title: string;
    id: string;
    depth?: number;
  } = $props();

  const indentRem = $derived(Math.max(0, depth - 1) * 0.75);
</script>

<div class="flex items-center">
  {#if depth > 0}
    <span class="mr-2 inline-flex items-center text-gray-400" style={`margin-left: ${indentRem}rem`}>
      <CornerDownRightIcon class="h-4 w-4" aria-hidden="true" />
    </span>
  {/if}

  <a
    href={`/admin/pages/${id}`}
    class="rounded-sm font-medium underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
  >
    {title || 'Untitled'}
  </a>
</div>
