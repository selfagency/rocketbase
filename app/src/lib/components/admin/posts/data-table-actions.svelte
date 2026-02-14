<script lang="ts">
  import { enhance } from '$app/forms';
  import * as AlertDialog from '$lib/components/ui/alert-dialog';
  import { Button } from '$lib/components/ui/button';
  import * as Tooltip from '$lib/components/ui/tooltip';
  import type { PostsResponseWithExpanded } from '$lib/types/pocketbase-expanded';
  import PencilIcon from '@lucide/svelte/icons/pencil';
  import TrashIcon from '@lucide/svelte/icons/trash';
  import Undo2Icon from '@lucide/svelte/icons/undo-2';
  import ViewIcon from '@lucide/svelte/icons/view';

  let { post }: { post: PostsResponseWithExpanded } = $props();

  let deleteFormElement: HTMLFormElement | undefined = $state();
  let undeleteFormElement: HTMLFormElement | undefined = $state();
  let isDeleting = $state(false);
  let isRestoring = $state(false);
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
          disabled={!post.slug}
          aria-label="Preview post"
        >
          <ViewIcon class="size-4" />
        </Button>
      {/snippet}
    </Tooltip.Trigger>
    <Tooltip.Content>Preview post</Tooltip.Content>
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
          aria-label="Edit post"
        >
          <PencilIcon class="size-4" />
        </Button>
      {/snippet}
    </Tooltip.Trigger>
    <Tooltip.Content>Edit post</Tooltip.Content>
  </Tooltip.Root>

  {#if post.in_trash}
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
            aria-label="Restore post"
          >
            <Undo2Icon class="size-4" />
          </Button>
        {/snippet}
      </Tooltip.Trigger>
      <Tooltip.Content>Restore post</Tooltip.Content>
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
            aria-label="Delete post"
          >
            <TrashIcon class="size-4" />
          </Button>
        {/snippet}
      </Tooltip.Trigger>
      <Tooltip.Content>Delete post</Tooltip.Content>
    </Tooltip.Root>
  {/if}
</div>

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
