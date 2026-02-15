<script lang="ts">
  import PexelsLogo from '$lib/assets/pexels_logo.svg?component';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import * as ScrollArea from '$lib/components/ui/scroll-area';
  import Spinner from '$lib/components/ui/spinner/spinner.svelte';
  import * as Tabs from '$lib/components/ui/tabs';
  import { STANDARD_IMAGE_SIZE_PRESETS, type StandardImageSizeKey } from '$lib/utils/image-sizes';
  import type { PexelsPhoto, TipexMediaItem } from '$lib/components/ui/tipex-media-modal.types';

  let {
    activeTab = $bindable<'attached' | 'all' | 'pexels'>('attached'),
    selectedInsertSize = $bindable<StandardImageSizeKey>('md'),
    pexelsEnabled,
    errorMessage = '',
    successMessage = '',
    uploadInProgress,
    uploadPercent,
    loadingAttached,
    loadingAll,
    loadingPexels,
    importInProgressId,
    attachedItems,
    allItems,
    pexelsItems,
    allQuery = $bindable(''),
    pexelsQuery = $bindable(''),
    attachmentIds,
    formatDate,
    onUploadInputChange,
    onSearchAll,
    onSearchPexels,
    onManage,
    onInsert,
    onImportPexels,
  }: {
    activeTab?: 'attached' | 'all' | 'pexels';
    selectedInsertSize?: StandardImageSizeKey;
    pexelsEnabled: boolean;
    errorMessage?: string;
    successMessage?: string;
    uploadInProgress: boolean;
    uploadPercent: number;
    loadingAttached: boolean;
    loadingAll: boolean;
    loadingPexels: boolean;
    importInProgressId: number | null;
    attachedItems: TipexMediaItem[];
    allItems: TipexMediaItem[];
    pexelsItems: PexelsPhoto[];
    allQuery?: string;
    pexelsQuery?: string;
    attachmentIds: string[];
    formatDate: (value: string) => string;
    onUploadInputChange: (event: Event) => void;
    onSearchAll: () => void;
    onSearchPexels: () => void;
    onManage: (item: TipexMediaItem) => void;
    onInsert: (item: TipexMediaItem) => void;
    onImportPexels: (item: PexelsPhoto) => void;
  } = $props();
</script>

<section class="space-y-3 p-4 sm:p-6">
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

  <Tabs.Root bind:value={activeTab} class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/20 px-3 py-2">
      <p class="text-xs text-muted-foreground">Choose image size to insert into the editor.</p>
      <div class="flex items-center gap-2">
        <Label for="insert-size" class="text-xs">Insert size</Label>
        <select
          id="insert-size"
          bind:value={selectedInsertSize}
          class="flex h-8 rounded-md border border-input bg-background px-2 text-xs"
        >
          {#each STANDARD_IMAGE_SIZE_PRESETS as preset (preset.key)}
            <option value={preset.key}>{preset.label}</option>
          {/each}
        </select>
      </div>
    </div>

    <Tabs.List class={`grid w-full ${pexelsEnabled ? 'grid-cols-3' : 'grid-cols-2'}`}>
      <Tabs.Trigger value="attached">This entry</Tabs.Trigger>
      <Tabs.Trigger value="all">All media</Tabs.Trigger>
      {#if pexelsEnabled}
        <Tabs.Trigger value="pexels">Pexels</Tabs.Trigger>
      {/if}
    </Tabs.List>

    <Tabs.Content value="attached" class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2">
        <div class="space-y-1">
          <p class="text-sm font-medium">Upload media</p>
          <p class="text-xs text-muted-foreground">
            Images are uploaded to your media library and linked to this entry.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <Label for="upload-media-input" class="sr-only">Upload media file</Label>
          <Input
            id="upload-media-input"
            type="file"
            accept="image/*"
            multiple
            oninput={onUploadInputChange}
            class="max-w-[16rem]"
          />
        </div>
      </div>

      {#if uploadInProgress}
        <div class="space-y-2 rounded-md border px-3 py-2">
          <p class="text-xs text-muted-foreground">Uploading... {uploadPercent}%</p>
          <progress value={uploadPercent} max="100" class="h-2 w-full" aria-label="Upload progress"></progress>
        </div>
      {/if}

      <ScrollArea.Root class="h-[52vh] rounded-md border p-3">
        {#if loadingAttached}
          <div class="flex h-full items-center justify-center">
            <Spinner class="size-5" />
          </div>
        {:else if attachedItems.length === 0}
          <p class="text-sm text-muted-foreground">No media linked yet. Upload an image to get started.</p>
        {:else}
          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {#each attachedItems as item (item.id)}
              <article class="space-y-2 rounded-md border p-2">
                <img src={item.url} alt={item.altText || 'Media preview'} class="h-40 w-full rounded-sm object-cover" />
                <div class="space-y-1">
                  <div class="flex items-center justify-between gap-2">
                    <Badge variant="outline">{item.source || 'upload'}</Badge>
                    <span class="text-xs text-muted-foreground">{formatDate(item.updated)}</span>
                  </div>
                  <p class="line-clamp-2 text-xs text-muted-foreground">
                    {item.caption || item.altText || 'No description yet.'}
                  </p>
                </div>
                <div class="flex gap-2">
                  <Button type="button" size="sm" variant="outline" onclick={() => onManage(item)}>Manage</Button>
                  <Button type="button" size="sm" onclick={() => onInsert(item)}>Insert</Button>
                </div>
              </article>
            {/each}
          </div>
        {/if}
      </ScrollArea.Root>
    </Tabs.Content>

    <Tabs.Content value="all" class="space-y-4">
      <form
        class="flex flex-col gap-2 sm:flex-row"
        onsubmit={event => {
          event.preventDefault();
          onSearchAll();
        }}
      >
        <Label for="all-media-search" class="sr-only">Search all media</Label>
        <Input id="all-media-search" bind:value={allQuery} placeholder="Search by alt text, caption, source" />
        <Button type="submit" variant="outline">Search</Button>
      </form>

      <ScrollArea.Root class="h-[58vh] rounded-md border p-3">
        {#if loadingAll}
          <div class="flex h-full items-center justify-center">
            <Spinner class="size-5" />
          </div>
        {:else if allItems.length === 0}
          <p class="text-sm text-muted-foreground">No media found.</p>
        {:else}
          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {#each allItems as item (item.id)}
              <article class="space-y-2 rounded-md border p-2">
                <img src={item.url} alt={item.altText || 'Media preview'} class="h-40 w-full rounded-sm object-cover" />
                <div class="space-y-1">
                  <div class="flex items-center justify-between gap-2">
                    <Badge variant="outline">{item.source || 'upload'}</Badge>
                    {#if attachmentIds.includes(item.id)}
                      <Badge>Linked</Badge>
                    {/if}
                  </div>
                  <p class="line-clamp-2 text-xs text-muted-foreground">
                    {item.caption || item.altText || 'No description yet.'}
                  </p>
                </div>
                <div class="flex gap-2">
                  <Button type="button" size="sm" variant="outline" onclick={() => onManage(item)}>Manage</Button>
                  <Button type="button" size="sm" onclick={() => onInsert(item)}>Insert</Button>
                </div>
              </article>
            {/each}
          </div>
        {/if}
      </ScrollArea.Root>
    </Tabs.Content>

    {#if pexelsEnabled}
      <Tabs.Content value="pexels" class="space-y-4">
        <div class="flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-2">
          <PexelsLogo role="img" aria-label="Pexels logo" class="h-5 w-auto" />
          <p class="text-xs text-muted-foreground">
            Imported images include attribution metadata. Please keep credit links where possible.
          </p>
        </div>

        <form
          class="flex flex-col gap-2 sm:flex-row"
          onsubmit={event => {
            event.preventDefault();
            onSearchPexels();
          }}
        >
          <Label for="pexels-search" class="sr-only">Search Pexels</Label>
          <Input id="pexels-search" bind:value={pexelsQuery} placeholder="Search Pexels photos" />
          <Button type="submit" variant="outline">Search Pexels</Button>
        </form>

        <ScrollArea.Root class="h-[56vh] rounded-md border p-3">
          {#if loadingPexels}
            <div class="flex h-full items-center justify-center">
              <Spinner class="size-5" />
            </div>
          {:else if pexelsItems.length === 0}
            <p class="text-sm text-muted-foreground">Search to browse photos from Pexels.</p>
          {:else}
            <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {#each pexelsItems as item (item.id)}
                <article class="space-y-2 rounded-md border p-2">
                  <img
                    src={item.src.medium}
                    alt={item.alt || `Photo by ${item.photographer}`}
                    class="h-40 w-full rounded-sm object-cover"
                  />
                  <p class="line-clamp-2 text-xs text-muted-foreground">Photo by {item.photographer} on Pexels</p>
                  <div class="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onclick={() => onImportPexels(item)}
                      disabled={importInProgressId === item.id}
                    >
                      {#if importInProgressId === item.id}
                        <Spinner class="size-4" />
                      {/if}
                      Import &amp; Insert
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      href={item.photoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </Button>
                  </div>
                </article>
              {/each}
            </div>
          {/if}
        </ScrollArea.Root>
      </Tabs.Content>
    {/if}
  </Tabs.Root>
</section>
