<script lang="ts">
  import PencilIcon from '@lucide/svelte/icons/pencil';
  import TrashIcon from '@lucide/svelte/icons/trash';
  import { Button } from '$lib/components/ui/button/index.js';
  import type { PagesResponse } from '$lib/types/pocketbase';
  import { enhance } from '$app/forms';

  let { page }: { page: PagesResponse } = $props();

  let deleteFormElement: HTMLFormElement | undefined = $state();
  let isDeleting = $state(false);

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
  <Button variant="ghost" size="icon" class="relative size-8 p-0" onclick={handleEdit} aria-label="Edit page">
    <PencilIcon class="size-4" />
  </Button>
  <Button
    variant="ghost"
    size="icon"
    class="relative size-8 p-0 text-destructive hover:text-destructive"
    onclick={handleDelete}
    disabled={isDeleting}
    aria-label="Delete page"
  >
    <TrashIcon class="size-4" />
  </Button>
</div>

<!-- Hidden form for delete action -->
<form bind:this={deleteFormElement} method="POST" action="?/delete" use:enhance class="hidden">
  <input type="hidden" name="id" value={page.id} />
</form>
