<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Command from '$lib/components/ui/command/index.js';
  import * as Popover from '$lib/components/ui/popover/index.js';
  import { cn } from '$lib/utils.js';
  import CheckIcon from '@lucide/svelte/icons/check';
  import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
  import { tick } from 'svelte';

  let {
    options = [] as { id: string; name: string }[],
    value = '',
    placeholder = 'Select...',
    onchange,
  }: {
    options?: { id: string; name: string }[];
    value?: string;
    placeholder?: string;
    onchange?: (value: string) => void;
  } = $props();

  let open = $state(false);
  let triggerRef = $state<HTMLButtonElement>(null!);

  const selectedValue = $derived(options.find(f => f.id === value)?.name);

  // We want to refocus the trigger button when the user selects
  // an item from the list so users can continue navigating the
  // rest of the form with the keyboard.
  function closeAndFocusTrigger() {
    open = false;
    tick().then(() => {
      triggerRef.focus();
    });
  }

  function selectOption(selectedValue: string) {
    value = selectedValue;
    onchange?.(selectedValue);
    closeAndFocusTrigger();
  }
</script>

<Popover.Root bind:open>
  <Popover.Trigger bind:ref={triggerRef}>
    {#snippet child({ props })}
      <Button {...props} variant="outline" class="w-50 justify-between" role="combobox" aria-expanded={open}>
        {selectedValue || placeholder}
        <ChevronsUpDownIcon class="opacity-50" />
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-50 p-0">
    <Command.Root>
      <Command.Input placeholder="Search..." />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>
        <Command.Group>
          {#each options as option (option.id)}
            <Command.Item value={option.id} onSelect={() => selectOption(option.id)}>
              <CheckIcon class={cn(value !== option.id && 'text-transparent')} />
              {option.name}
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
