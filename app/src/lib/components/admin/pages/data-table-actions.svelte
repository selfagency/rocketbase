<script lang="ts">
  import { enhance } from '$app/forms';
  import * as AlertDialog from '$lib/components/ui/alert-dialog';
  import { Button } from '$lib/components/ui/button';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import * as Tooltip from '$lib/components/ui/tooltip';
  import type { PagesResponse } from '$lib/types/pocketbase';
  import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
  import PencilIcon from '@lucide/svelte/icons/pencil';
  import TrashIcon from '@lucide/svelte/icons/trash';
  import Undo2Icon from '@lucide/svelte/icons/undo-2';
  import ViewIcon from '@lucide/svelte/icons/view';

  let { page }: { page: PagesResponse } = $props();

  let deleteFormElement: HTMLFormElement | undefined = $state();
  let undeleteFormElement: HTMLFormElement | undefined = $state();
  let isDeleting = $state(false);
  let isRestoring = $state(false);
  let showDeleteDialog = $state(false);
  let showRestoreDialog = $state(false);

  function handlePreview() {
    window.open(`/preview/pages/${page.id}`, '_blank', 'noopener,noreferrer');
  }

  function handleEdit() {
    window.location.href = `/admin/pages/${page.id}`;
  }

  function confirmDelete() {
    isDeleting = true;
    showDeleteDialog = false;
    deleteFormElement?.requestSubmit();
  }

  function confirmRestore() {
    isRestoring = true;
    showRestoreDialog = false;
    undeleteFormElement?.requestSubmit();
  }
</script>

<!-- Inline buttons for medium+ screens -->
<div class="hidden items-center gap-1 md:flex">
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

  {#if page.in_trash}
    <Tooltip.Root>
      <Tooltip.Trigger>
        {#snippet child({ props })}
          <Button
            {...props}
            variant="ghost"
            size="icon"
            class="relative size-8 p-0 text-primary hover:text-primary"
            onclick={() => (showRestoreDialog = true)}
            disabled={isRestoring}
            aria-label="Restore page"
          >
            <Undo2Icon class="size-4" />
          </Button>
        {/snippet}
      </Tooltip.Trigger>
      <Tooltip.Content>Restore page</Tooltip.Content>
    </Tooltip.Root>
  {:else}
    <Tooltip.Root>
      <Tooltip.Trigger>
        {#snippet child({ props })}
          <Button
            {...props}
            variant="ghost"
            size="icon"
            class="relative size-8 p-0 text-destructive hover:text-destructive"
            onclick={() => (showDeleteDialog = true)}
            disabled={isDeleting}
            aria-label="Delete page"
          >
            <TrashIcon class="size-4" />
          </Button>
        {/snippet}
      </Tooltip.Trigger>
      <Tooltip.Content>Delete page</Tooltip.Content>
    </Tooltip.Root>
  {/if}
</div>

<!-- Dropdown menu for small screens -->
<div class="md:hidden">
  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      {#snippet child(props)}
        <Button variant="ghost" size="icon" class="size-8 p-0" {...props}>
          <EllipsisIcon class="size-4" />
          <span class="sr-only">Actions</span>
        </Button>
      {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content align="end">
      <DropdownMenu.Item onclick={handlePreview}>
        <ViewIcon class="mr-2 size-4" />
        Preview
      </DropdownMenu.Item>
      <DropdownMenu.Item onclick={handleEdit}>
        <PencilIcon class="mr-2 size-4" />
        Edit
      </DropdownMenu.Item>
      <DropdownMenu.Separator />
      {#if page.in_trash}
        <DropdownMenu.Item onclick={() => (showRestoreDialog = true)} disabled={isRestoring}>
          <Undo2Icon class="mr-2 size-4" />
          Restore
        </DropdownMenu.Item>
      {:else}
        <DropdownMenu.Item
          onclick={() => (showDeleteDialog = true)}
          disabled={isDeleting}
          class="text-destructive focus:text-destructive"
        >
          <TrashIcon class="mr-2 size-4" />
          Delete
        </DropdownMenu.Item>
      {/if}
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</div>

<AlertDialog.Root bind:open={showDeleteDialog}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Delete Page</AlertDialog.Title>
      <AlertDialog.Description>
        Are you sure you want to delete "{page.title || 'this page'}"? This will move it to the trash where it can be
        restored or permanently deleted later.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action onclick={confirmDelete}>Delete</AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>

<AlertDialog.Root bind:open={showRestoreDialog}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Restore Page</AlertDialog.Title>
      <AlertDialog.Description>
        Are you sure you want to restore "{page.title || 'this page'}"? This will remove it from the trash and return it
        to draft status.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action onclick={confirmRestore}>Restore</AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>

<!-- Hidden form for delete action -->
<form bind:this={deleteFormElement} method="POST" action="?/delete" use:enhance class="hidden">
  <input type="hidden" name="id" value={page.id} />
</form>

<!-- Hidden form for undelete action -->
<form bind:this={undeleteFormElement} method="POST" action="?/undelete" use:enhance class="hidden">
  <input type="hidden" name="id" value={page.id} />
</form>
