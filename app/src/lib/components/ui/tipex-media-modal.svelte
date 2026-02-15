<script lang="ts">
  import PexelsLogo from '$lib/assets/pexels_logo.svg?component';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import * as ScrollArea from '$lib/components/ui/scroll-area';
  import Spinner from '$lib/components/ui/spinner/spinner.svelte';
  import * as Tabs from '$lib/components/ui/tabs';
  import { Textarea } from '$lib/components/ui/textarea';
  import { getStandardImageUrl, STANDARD_IMAGE_SIZE_PRESETS, type StandardImageSizeKey } from '$lib/utils/image-sizes';

  type EntityType = 'post' | 'page';

  export type TipexMediaItem = {
    id: string;
    url: string;
    altText: string;
    caption: string;
    source: string;
    sourceUrl: string;
    created: string;
    updated: string;
    attribution?: {
      photographer?: string;
      photographerUrl?: string;
      photoUrl?: string;
      provider?: string;
    };
  };

  type PexelsPhoto = {
    id: number;
    alt: string;
    width: number;
    height: number;
    src: {
      tiny: string;
      medium: string;
      large: string;
      original: string;
    };
    photoUrl: string;
    photographer: string;
    photographerUrl: string;
  };

  let {
    open = $bindable(false),
    attachments = $bindable<string[]>(),
    entityType,
    entityId,
    pexelsEnabled = false,
    onInsert,
  }: {
    open?: boolean;
    attachments?: string[];
    entityType?: EntityType;
    entityId?: string;
    pexelsEnabled?: boolean;
    onInsert?: (media: TipexMediaItem) => void;
  } = $props();

  let activeTab = $state<'attached' | 'all' | 'pexels'>('attached');
  let attachedItems = $state<TipexMediaItem[]>([]);
  let allItems = $state<TipexMediaItem[]>([]);
  let pexelsItems = $state<PexelsPhoto[]>([]);

  let allQuery = $state('');
  let pexelsQuery = $state('');

  let loadingAttached = $state(false);
  let loadingAll = $state(false);
  let loadingPexels = $state(false);
  let uploadInProgress = $state(false);
  let uploadPercent = $state(0);
  let importInProgressId = $state<number | null>(null);
  let errorMessage = $state('');
  let successMessage = $state('');
  let selectedInsertSize = $state<StandardImageSizeKey>('md');

  let editingMedia = $state<TipexMediaItem | null>(null);
  let editAltText = $state('');
  let editCaption = $state('');

  function currentAttachments(): string[] {
    return Array.isArray(attachments) ? attachments : [];
  }

  function formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }

  function buildAttachmentIds(): string {
    return currentAttachments().filter(Boolean).join(',');
  }

  function mergeAttachment(id: string) {
    if (!id) return;
    const current = currentAttachments();
    if (!current.includes(id)) {
      attachments = [...current, id];
    }
  }

  function removeAttachment(id: string) {
    attachments = currentAttachments().filter(value => value !== id);
  }

  async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, init);
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({ error: 'Request failed.' }))) as { error?: string };
      throw new Error(payload.error || 'Request failed.');
    }

    return (await response.json()) as T;
  }

  async function loadAttachedItems() {
    loadingAttached = true;
    errorMessage = '';

    try {
      const params = new URLSearchParams({
        scope: 'attached',
        attachmentIds: buildAttachmentIds(),
      });

      if (entityType) params.set('entityType', entityType);
      if (entityId) params.set('entityId', entityId);

      const payload = await fetchJson<{ items: TipexMediaItem[] }>(`/api/admin/media?${params.toString()}`);
      attachedItems = payload.items;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load media.';
      errorMessage = message;
    } finally {
      loadingAttached = false;
    }
  }

  async function loadAllItems() {
    loadingAll = true;
    errorMessage = '';

    try {
      const params = new URLSearchParams({
        scope: 'all',
        perPage: '30',
      });

      if (allQuery.trim()) {
        params.set('q', allQuery.trim());
      }

      const payload = await fetchJson<{ items: TipexMediaItem[] }>(`/api/admin/media?${params.toString()}`);
      allItems = payload.items;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load media.';
      errorMessage = message;
    } finally {
      loadingAll = false;
    }
  }

  async function searchPexels() {
    if (!pexelsEnabled) {
      pexelsItems = [];
      return;
    }

    loadingPexels = true;
    errorMessage = '';

    try {
      const params = new URLSearchParams({
        provider: 'pexels',
        perPage: '24',
      });

      if (pexelsQuery.trim()) {
        params.set('q', pexelsQuery.trim());
      }

      const payload = await fetchJson<{ photos: PexelsPhoto[] }>(`/api/admin/media?${params.toString()}`);
      pexelsItems = payload.photos;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to search Pexels.';
      errorMessage = message;
    } finally {
      loadingPexels = false;
    }
  }

  async function preloadCuratedPexels() {
    if (!pexelsEnabled) return;
    if (pexelsItems.length > 0) return;

    const currentQuery = pexelsQuery;
    pexelsQuery = '';
    await searchPexels();
    pexelsQuery = currentQuery;
  }

  async function refreshActiveViews() {
    await Promise.all([loadAttachedItems(), loadAllItems()]);
  }

  async function onUploadInputChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    input.value = '';
    await uploadFiles(files);
  }

  async function uploadFiles(files: File[]) {
    if (files.length === 0) return;

    uploadInProgress = true;
    uploadPercent = 0;
    errorMessage = '';

    try {
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const media = await uploadSingleFile(file, index, files.length);
        mergeAttachment(media.id);
      }

      await refreshActiveViews();
      successMessage =
        files.length === 1 ? 'Media uploaded successfully.' : `${files.length} files uploaded successfully.`;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed.';
      errorMessage = message;
    } finally {
      uploadInProgress = false;
      uploadPercent = 0;
    }
  }

  function uploadSingleFile(file: File, index: number, total: number): Promise<TipexMediaItem> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/admin/media');

      xhr.upload.onprogress = event => {
        if (!event.lengthComputable) return;

        const currentFilePercent = (event.loaded / event.total) * 100;
        const totalPercent = ((index + currentFilePercent / 100) / total) * 100;
        uploadPercent = Math.round(totalPercent);
      };

      xhr.onerror = () => reject(new Error('Network error while uploading file.'));

      xhr.onload = () => {
        if (xhr.status < 200 || xhr.status >= 300) {
          try {
            const payload = JSON.parse(xhr.responseText) as { error?: string };
            reject(new Error(payload.error || 'Upload failed.'));
          } catch {
            reject(new Error('Upload failed.'));
          }
          return;
        }

        try {
          const payload = JSON.parse(xhr.responseText) as { media: TipexMediaItem };
          resolve(payload.media);
        } catch {
          reject(new Error('Invalid upload response.'));
        }
      };

      const formData = new FormData();
      formData.append('action', 'upload');
      formData.append('file', file);
      xhr.send(formData);
    });
  }

  function beginManage(media: TipexMediaItem) {
    editingMedia = media;
    editAltText = media.altText;
    editCaption = media.caption;
    errorMessage = '';
    successMessage = '';
  }

  async function saveManagedMedia() {
    if (!editingMedia) return;

    try {
      const payload = await fetchJson<{ media: TipexMediaItem }>('/api/admin/media', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingMedia.id,
          altText: editAltText,
          caption: editCaption,
        }),
      });

      const apply = (list: TipexMediaItem[]) => list.map(item => (item.id === payload.media.id ? payload.media : item));
      attachedItems = apply(attachedItems);
      allItems = apply(allItems);
      editingMedia = payload.media;
      successMessage = 'Media details saved successfully.';
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update media.';
      errorMessage = message;
    }
  }

  async function deleteManagedMedia() {
    if (!editingMedia) return;
    const mediaId = editingMedia.id;

    try {
      await fetchJson<{ success: boolean }>(`/api/admin/media?id=${mediaId}`, {
        method: 'DELETE',
      });

      removeAttachment(mediaId);
      attachedItems = attachedItems.filter(item => item.id !== mediaId);
      allItems = allItems.filter(item => item.id !== mediaId);
      editingMedia = null;
      successMessage = 'Media deleted successfully.';
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete media.';
      errorMessage = message;
    }
  }

  async function importPexels(photo: PexelsPhoto) {
    if (!pexelsEnabled) {
      errorMessage = 'Pexels is not configured for this environment.';
      return;
    }

    importInProgressId = photo.id;
    errorMessage = '';

    try {
      const formData = new FormData();
      formData.append('action', 'import-pexels');
      formData.append('sourceUrl', photo.src.original);
      formData.append('photoUrl', photo.photoUrl);
      formData.append('photographer', photo.photographer);
      formData.append('photographerUrl', photo.photographerUrl);
      formData.append('altText', photo.alt || `Photo by ${photo.photographer} on Pexels`);

      const payload = await fetchJson<{ media: TipexMediaItem }>('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      const mediaWithSelectedSize: TipexMediaItem = {
        ...payload.media,
        url: getStandardImageUrl(payload.media.url, selectedInsertSize),
      };

      mergeAttachment(payload.media.id);
      onInsert?.(mediaWithSelectedSize);
      await refreshActiveViews();
      successMessage = 'Pexels photo imported successfully.';
      open = false;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to import image from Pexels.';
      errorMessage = message;
    } finally {
      importInProgressId = null;
    }
  }

  function insertMedia(media: TipexMediaItem) {
    const url = getStandardImageUrl(media.url, selectedInsertSize);
    const mediaWithSelectedSize: TipexMediaItem = {
      ...media,
      url,
    };

    mergeAttachment(media.id);
    onInsert?.(mediaWithSelectedSize);
    successMessage = 'Media inserted into editor.';
    open = false;
  }

  $effect(() => {
    if (!open) return;
    if (!pexelsEnabled && activeTab === 'pexels') {
      activeTab = 'attached';
    }
    successMessage = '';
    void refreshActiveViews();
    void preloadCuratedPexels();
  });
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="max-h-[90vh] w-[96vw] max-w-6xl overflow-hidden p-0 sm:w-[92vw]">
    <Dialog.Header class="border-b px-4 py-3 sm:px-6">
      <Dialog.Title>Insert media</Dialog.Title>
      <Dialog.Description>Upload, manage, or import images and insert them into the editor.</Dialog.Description>
    </Dialog.Header>

    {#if editingMedia}
      <section class="space-y-4 p-4 sm:p-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h3 class="text-sm font-semibold">Manage media</h3>
          <Button type="button" variant="outline" onclick={() => (editingMedia = null)}>Back to library</Button>
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
          <img
            src={editingMedia.url}
            alt={editingMedia.altText || 'Media preview'}
            class="h-72 w-full rounded-md border object-cover"
          />

          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="media-alt-text">Alt text</Label>
              <Input id="media-alt-text" bind:value={editAltText} placeholder="Describe this image" />
            </div>

            <div class="space-y-2">
              <Label for="media-caption">Caption</Label>
              <Textarea id="media-caption" bind:value={editCaption} rows={4} placeholder="Optional caption" />
            </div>

            <p class="text-xs text-muted-foreground">Uploaded {formatDate(editingMedia.created)}</p>

            <div class="flex flex-wrap gap-2">
              <Button type="button" onclick={saveManagedMedia}>Save</Button>
              <Button type="button" variant="destructive" onclick={deleteManagedMedia}>Delete</Button>
            </div>
          </div>
        </div>
      </section>
    {:else}
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
                      <img
                        src={item.url}
                        alt={item.altText || 'Media preview'}
                        class="h-40 w-full rounded-sm object-cover"
                      />
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
                        <Button type="button" size="sm" variant="outline" onclick={() => beginManage(item)}
                          >Manage</Button
                        >
                        <Button type="button" size="sm" onclick={() => insertMedia(item)}>Insert</Button>
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
                void loadAllItems();
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
                      <img
                        src={item.url}
                        alt={item.altText || 'Media preview'}
                        class="h-40 w-full rounded-sm object-cover"
                      />
                      <div class="space-y-1">
                        <div class="flex items-center justify-between gap-2">
                          <Badge variant="outline">{item.source || 'upload'}</Badge>
                          {#if currentAttachments().includes(item.id)}
                            <Badge>Linked</Badge>
                          {/if}
                        </div>
                        <p class="line-clamp-2 text-xs text-muted-foreground">
                          {item.caption || item.altText || 'No description yet.'}
                        </p>
                      </div>
                      <div class="flex gap-2">
                        <Button type="button" size="sm" variant="outline" onclick={() => beginManage(item)}
                          >Manage</Button
                        >
                        <Button type="button" size="sm" onclick={() => insertMedia(item)}>Insert</Button>
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
                  void searchPexels();
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
                            onclick={() => importPexels(item)}
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
    {/if}
  </Dialog.Content>
</Dialog.Root>
