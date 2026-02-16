<script lang="ts" module>
  export type MultiSelectOption = {
    value: string;
    label: string;
    disabled?: boolean;
  };
</script>

<script lang="ts">
  import { Badge } from '$lib/components/ui/badge';
  import { cn } from '$lib/utils';
  import CheckIcon from '@lucide/svelte/icons/check';
  import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
  import XIcon from '@lucide/svelte/icons/x';
  import { Combobox, useId } from 'bits-ui';

  type MultiSelectProps = {
    options?: MultiSelectOption[];
    value?: string[];
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    disabled?: boolean;
    class?: string;
    id?: string;
    name?: string;
    maxSelected?: number;
    onMaxSelected?: (maxSelected: number) => void;
    hideClearAllButton?: boolean;
    hidePlaceholderWhenSelected?: boolean;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean | 'true' | 'false';
    'aria-labelledby'?: string;
  };

  let {
    options = [],
    value = $bindable([]),
    placeholder = 'Select options',
    searchPlaceholder = 'Search options...',
    emptyMessage = 'No options found.',
    disabled = false,
    class: className,
    id,
    name,
    maxSelected = Number.MAX_SAFE_INTEGER,
    onMaxSelected,
    hideClearAllButton = false,
    hidePlaceholderWhenSelected = false,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    'aria-labelledby': ariaLabelledBy,
  }: MultiSelectProps = $props();

  let open = $state(false);
  let searchValue = $state('');
  let controlRef = $state<HTMLDivElement | null>(null);
  let inputRef = $state<HTMLInputElement | null>(null);
  const localId = useId();
  const inputId = $derived(id ?? `multi-select-${localId}`);
  const contentId = $derived(`${inputId}-content`);

  const normalizedValue = $derived(Array.isArray(value) ? value : []);
  const selectedSet = $derived(new Set(normalizedValue));
  const selectedOptions = $derived(options.filter(option => normalizedValue.includes(option.value)));
  const selectableOptions = $derived(options.filter(option => !selectedSet.has(option.value)));
  const showPlaceholder = $derived(!(hidePlaceholderWhenSelected && selectedOptions.length > 0));
  const showClearButton = $derived(!hideClearAllButton && !disabled && selectedOptions.length > 0);
  const showChevron = $derived(!hideClearAllButton && !disabled && selectedOptions.length === 0);
  const filteredOptions = $derived(
    selectableOptions.filter(option => {
      if (!searchValue.trim()) return true;
      return option.label.toLowerCase().includes(searchValue.trim().toLowerCase());
    })
  );

  function getValue() {
    return normalizedValue;
  }

  function setValue(nextValue: string[]) {
    if (nextValue.length > maxSelected) {
      onMaxSelected?.(maxSelected);
      return;
    }

    value = nextValue;
  }

  function removeOption(optionValue: string, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    value = normalizedValue.filter(item => item !== optionValue);
  }

  function clearSelection() {
    value = [];
    searchValue = '';
    if (inputRef) {
      inputRef.value = '';
    }
    inputRef?.focus();
  }

  function handleInputKeyDown(event: KeyboardEvent) {
    if (disabled) return;

    if ((event.key === 'Backspace' || event.key === 'Delete') && searchValue === '' && normalizedValue.length > 0) {
      event.preventDefault();
      value = normalizedValue.slice(0, -1);
    }

    if (event.key === 'Escape') {
      inputRef?.blur();
      open = false;
    }
  }

  function focusInput() {
    if (disabled) return;
    inputRef?.focus();
    open = true;
  }

  function handleContainerKeyDown(event: KeyboardEvent) {
    if (disabled) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      focusInput();
    }
  }

  function handleOpenChangeComplete(nextOpen: boolean) {
    if (!nextOpen) {
      searchValue = '';
      if (inputRef) {
        inputRef.value = '';
      }
    }
  }

  function handleValueChange(nextValue: string[]) {
    setValue(nextValue);
    searchValue = '';
    if (inputRef) {
      inputRef.value = '';
    }
  }
</script>

<Combobox.Root
  type="multiple"
  bind:value={getValue, setValue}
  bind:open
  {disabled}
  {name}
  onValueChange={handleValueChange}
  onOpenChangeComplete={handleOpenChangeComplete}
>
  <div
    bind:this={controlRef}
    class={cn(
      'relative flex min-h-10 items-center justify-between rounded-md border border-input bg-[oklch(0.985_0_0)] px-3 py-2 text-base ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 md:text-sm',
      !disabled && selectedOptions.length > 0 && 'cursor-text',
      disabled && 'opacity-60',
      className
    )}
    onmousedown={event => {
      if (disabled) return;
      // Keep focus behavior stable and avoid text-selection glitches.
      event.preventDefault();
      focusInput();
    }}
    tabindex={disabled ? -1 : 0}
    role="button"
    aria-haspopup="listbox"
    aria-expanded={open}
    aria-controls={contentId}
    onkeydown={handleContainerKeyDown}
  >
    <div class="relative flex flex-1 flex-wrap items-center gap-1" aria-live="polite">
      {#each selectedOptions as option (option.value)}
        <Badge variant="default" class="gap-1 pe-1 text-white">
          <span class="max-w-44 truncate">{option.label}</span>
          <button
            type="button"
            class={cn(
              'ml-1 rounded-full p-0.5 text-white/90 ring-offset-background outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              disabled && 'hidden'
            )}
            aria-label={`Remove ${option.label}`}
            {disabled}
            onmousedown={event => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onclick={event => removeOption(option.value, event)}
          >
            <XIcon class="size-3" />
          </button>
        </Badge>
      {/each}

      <Combobox.Input
        id={inputId}
        bind:ref={inputRef}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-labelledby={ariaLabelledBy}
        onkeydown={handleInputKeyDown}
        onfocus={() => {
          open = true;
        }}
        oninput={event => {
          searchValue = event.currentTarget.value;
        }}
        class={cn(
          'h-auto flex-1 appearance-none self-baseline border-0 bg-transparent p-0 text-sm shadow-none ring-0 outline-none placeholder:text-muted-foreground focus:border-0 focus:ring-0 focus:outline-none',
          hidePlaceholderWhenSelected ? 'w-full' : 'min-w-24',
          selectedOptions.length !== 0 && 'ml-1'
        )}
        placeholder={showPlaceholder ? searchPlaceholder || placeholder : ''}
        {disabled}
      />
    </div>

    <div class="ml-2 flex items-center gap-1 self-center">
      {#if showClearButton}
        <button
          type="button"
          class="size-5 rounded-sm text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none"
          aria-label="Clear selected options"
          onmousedown={event => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onclick={clearSelection}
        >
          <XIcon class="size-4" />
        </button>
      {/if}
      <Combobox.Trigger class={cn('size-5 text-muted-foreground/50', !showChevron && 'hidden')}>
        <ChevronsUpDownIcon class="size-4" />
      </Combobox.Trigger>
    </div>
  </div>

  <div class="relative">
    {#if open}
      <Combobox.ContentStatic
        id={contentId}
        class="surface-enter absolute top-1 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-hidden"
        onmouseup={() => {
          inputRef?.focus();
        }}
      >
        <Combobox.Viewport class="max-h-64 overflow-auto p-1">
          {#if filteredOptions.length === 0}
            <span class="block px-5 py-2 text-sm text-muted-foreground">{emptyMessage}</span>
          {:else}
            {#each filteredOptions as option (option.value)}
              <Combobox.Item
                value={option.value}
                label={option.label}
                disabled={disabled || option.disabled}
                class={cn(
                  'flex h-10 w-full items-center rounded-sm py-2 pr-1.5 pl-3 text-sm outline-hidden select-none',
                  'data-highlighted:bg-accent data-highlighted:text-accent-foreground',
                  option.disabled && 'cursor-default text-muted-foreground'
                )}
                onmousedown={event => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
              >
                {#snippet children({ selected })}
                  <span>{option.label}</span>
                  {#if selected}
                    <CheckIcon class="ml-auto size-4" />
                  {/if}
                {/snippet}
              </Combobox.Item>
            {/each}
          {/if}
        </Combobox.Viewport>
      </Combobox.ContentStatic>
    {/if}
  </div>
</Combobox.Root>
