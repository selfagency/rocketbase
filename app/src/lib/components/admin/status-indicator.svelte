<script lang="ts">
  import * as Tooltip from '$lib/components/ui/tooltip';
  import { cn } from '$lib/utils';

  type StatusTone = 'published' | 'draft' | 'trash';

  let {
    label,
    tone = 'draft',
  }: {
    label: string;
    tone?: StatusTone;
  } = $props();

  const toneStyles: Record<StatusTone, { dot: string; pill: string }> = {
    published: {
      dot: 'bg-green-500',
      pill: 'bg-green-100 text-green-800',
    },
    draft: {
      dot: 'bg-gray-500',
      pill: 'bg-gray-100 text-gray-800',
    },
    trash: {
      dot: 'bg-rose-500',
      pill: 'bg-rose-100 text-rose-800',
    },
  };
</script>

<Tooltip.Root>
  <Tooltip.Trigger>
    {#snippet child({ props })}
      <span {...props} class="inline-flex items-center" aria-label={label}>
        <span class={cn('inline-block size-2.5 rounded-full md:hidden', toneStyles[tone].dot)} aria-hidden="true"
        ></span>
        <span
          class={cn('hidden rounded-full px-1.5 py-0.5 text-[11px] font-medium md:inline-flex', toneStyles[tone].pill)}
        >
          {label}
        </span>
      </span>
    {/snippet}
  </Tooltip.Trigger>

  <Tooltip.Content class="md:hidden" side="top" sideOffset={6}>
    <p>{label}</p>
  </Tooltip.Content>
</Tooltip.Root>
