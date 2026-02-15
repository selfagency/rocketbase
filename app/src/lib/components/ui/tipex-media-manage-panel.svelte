<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Textarea } from '$lib/components/ui/textarea';
  import type { TipexMediaItem } from '$lib/components/ui/tipex-media-modal.types';

  let {
    media,
    editAltText = $bindable(''),
    editCaption = $bindable(''),
    errorMessage = '',
    successMessage = '',
    formatDate,
    onBack,
    onSave,
    onDelete,
  }: {
    media: TipexMediaItem;
    editAltText?: string;
    editCaption?: string;
    errorMessage?: string;
    successMessage?: string;
    formatDate: (value: string) => string;
    onBack: () => void;
    onSave: () => void;
    onDelete: () => void;
  } = $props();
</script>

<section class="space-y-4 p-4 sm:p-6">
  <div class="flex flex-wrap items-center justify-between gap-3">
    <h3 class="text-sm font-semibold">Manage media</h3>
    <Button type="button" variant="outline" onclick={onBack}>Back to library</Button>
  </div>

  {#if errorMessage}
    <p class="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {errorMessage}
    </p>
  {/if}

  {#if successMessage}
    <p
      class="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300"
    >
      {successMessage}
    </p>
  {/if}

  <div class="grid gap-4 md:grid-cols-[1fr_1.2fr]">
    <img src={media.url} alt={media.altText || 'Media preview'} class="h-72 w-full rounded-md border object-cover" />

    <div class="space-y-4">
      <div class="space-y-2">
        <Label for="media-alt-text">Alt text</Label>
        <Input id="media-alt-text" bind:value={editAltText} placeholder="Describe this image" />
      </div>

      <div class="space-y-2">
        <Label for="media-caption">Caption</Label>
        <Textarea id="media-caption" bind:value={editCaption} rows={4} placeholder="Optional caption" />
      </div>

      <p class="text-xs text-muted-foreground">Uploaded {formatDate(media.created)}</p>

      <div class="flex flex-wrap gap-2">
        <Button type="button" onclick={onSave}>Save</Button>
        <Button type="button" variant="destructive" onclick={onDelete}>Delete</Button>
      </div>
    </div>
  </div>
</section>
