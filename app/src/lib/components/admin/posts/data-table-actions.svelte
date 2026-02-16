<script lang="ts">
  import { enhance } from '$app/forms';
  import * as AlertDialog from '$lib/components/ui/alert-dialog';
  import { Button } from '$lib/components/ui/button';
  import * as Popover from '$lib/components/ui/popover';
  import type { PostsResponseWithExpanded } from '$lib/types/pocketbase-expanded';
  import EllipsisVerticalIcon from '@lucide/svelte/icons/ellipsis-vertical';
  import PencilIcon from '@lucide/svelte/icons/pencil';
  import TrashIcon from '@lucide/svelte/icons/trash';
  import Undo2Icon from '@lucide/svelte/icons/undo-2';
  import ViewIcon from '@lucide/svelte/icons/view';

  let { post }: { post: PostsResponseWithExpanded } = $props();

  let deleteFormElement: HTMLFormElement | undefined = $state();
  let undeleteFormElement: HTMLFormElement | undefined = $state();
  let isDeleting = $state(false);
  let isRestoring = $state(false);
  let actionsOpen = $state(false);
  let showDeleteDialog = $state(false);
  let showRestoreDialog = $state(false);

  function handlePreview() {
    if (!post.slug) return;
    window.open(`/preview/posts/${post.slug}`, '_blank', 'noopener,noreferrer');
  }

  function handleEdit() {
    window.location.href = `/admin/posts/${post.id}`;
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

  function openDeleteDialog() {
    actionsOpen = false;
    showDeleteDialog = true;
  }

  function openRestoreDialog() {
    actionsOpen = false;
    showRestoreDialog = true;
  }
</script>

<Popover.Root bind:open={actionsOpen}>
  <Popover.Trigger>
    {#snippet child({ props })}
      <Button variant="ghost" size="icon" class="size-8 p-0" {...props} aria-label="Post actions">
        <EllipsisVerticalIcon class="size-4" />
        <span class="sr-only">Post actions</span>
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="surface-enter w-40 p-2" align="end" sideOffset={6}>
    <div class="flex flex-col gap-1">
      <Button
        variant="ghost"
        size="sm"
        class="w-full justify-start"
        onclick={() => {
          actionsOpen = false;
          handlePreview();
        }}
        disabled={!post.slug}
      >
        <ViewIcon class="mr-2 size-4" />
        Preview
      </Button>

      <Button
        variant="ghost"
        size="sm"
        class="w-full justify-start"
        onclick={() => {
          actionsOpen = false;
          handleEdit();
        }}
      >
        <PencilIcon class="mr-2 size-4" />
        Edit
      </Button>

      {#if post.in_trash}
        <Button
          variant="ghost"
          size="sm"
          class="w-full justify-start text-primary hover:text-primary"
          onclick={openRestoreDialog}
          disabled={isRestoring}
        >
          <Undo2Icon class="mr-2 size-4" />
          Restore
        </Button>
      {:else}
        <Button
          variant="ghost"
          size="sm"
          class="w-full justify-start text-destructive hover:text-destructive"
          onclick={openDeleteDialog}
          disabled={isDeleting}
        >
          <TrashIcon class="mr-2 size-4" />
          Delete
        </Button>
      {/if}
    </div>
  </Popover.Content>
</Popover.Root>

<AlertDialog.Root bind:open={showDeleteDialog}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Delete Post</AlertDialog.Title>
      <AlertDialog.Description>
        Are you sure you want to delete "{post.title || 'this post'}"? This will move it to the trash where it can be
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
      <AlertDialog.Title>Restore Post</AlertDialog.Title>
      <AlertDialog.Description>
        Are you sure you want to restore "{post.title || 'this post'}"? This will remove it from the trash and return it
        to draft status.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action onclick={confirmRestore}>Restore</AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>

<form bind:this={deleteFormElement} method="POST" action="?/delete" use:enhance class="hidden">
  <input type="hidden" name="id" value={post.id} />
</form>

<form bind:this={undeleteFormElement} method="POST" action="?/undelete" use:enhance class="hidden">
  <input type="hidden" name="id" value={post.id} />
</form>
