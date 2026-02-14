<script lang="ts">
  import { enhance } from '$app/forms';
  import { Button } from '$lib/components/ui/button';
  import * as Tooltip from '$lib/components/ui/tooltip';
  import type { PagesResponse } from '$lib/types/pocketbase';
  import PencilIcon from '@lucide/svelte/icons/pencil';
  import TrashIcon from '@lucide/svelte/icons/trash';
  import ViewIcon from '@lucide/svelte/icons/view';

  let { page }: { page: PagesResponse } = $props();

  let deleteFormElement: HTMLFormElement | undefined = $state();
  let isDeleting = $state(false);

  function handlePreview() {
    window.open(`/preview/pages/${page.id}`, '_blank', 'noopener,noreferrer');
  }

  function handleEdit() {
    window.location.href = `/admin/pages/${page.id}`;
  }

  function handleDelete() {
    if (confirm(`Are you sure you want to delete "${page.title || 'this page'}"?`)) {
      isDeleting = true;
      deleteFormElement?.requestSubmit();
    }
  }
</script>

<div class="flex items-center gap-1">
  <Tooltip.Root>
    <Tooltip.Trigger>
      {#snippet child({ props })}
        <Button
          {...props}
          variant="ghost"
          size="icon"
          class="relative size-8 p-0"
          onclick={handlePreview}
          aria-label="Preview page"
        >
          <ViewIcon class="size-4" />
        </Button>
      {/snippet}
    </Tooltip.Trigger>
    <Tooltip.Content>Preview page</Tooltip.Content>
  </Tooltip.Root>

  <Tooltip.Root>
    <Tooltip.Trigger>
      {#snippet child({ props })}
        <Button
          {...props}
          variant="ghost"
          size="icon"
          class="relative size-8 p-0"
          onclick={handleEdit}
          aria-label="Edit page"
        >
          <PencilIcon class="size-4" />
        </Button>
      {/snippet}
    </Tooltip.Trigger>
    <Tooltip.Content>Edit page</Tooltip.Content>
  </Tooltip.Root>

  <Tooltip.Root>
    <Tooltip.Trigger>
      {#snippet child({ props })}
        <Button
          {...props}
          variant="ghost"
          size="icon"
          class="relative size-8 p-0 text-destructive hover:text-destructive"
          onclick={handleDelete}
          disabled={isDeleting}
          aria-label="Delete page"
        >
          <TrashIcon class="size-4" />
        </Button>
      {/snippet}
    </Tooltip.Trigger>
    <Tooltip.Content>Delete page</Tooltip.Content>
  </Tooltip.Root>
</div>

<!-- Hidden form for delete action -->
<form bind:this={deleteFormElement} method="POST" action="?/delete" use:enhance class="hidden">
  <input type="hidden" name="id" value={page.id} />
</form>
