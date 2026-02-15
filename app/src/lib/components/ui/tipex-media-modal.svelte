<script lang="ts">
  import TipexMediaLibraryTabs from '$lib/components/ui/tipex-media-library-tabs.svelte';
  import TipexMediaManagePanel from '$lib/components/ui/tipex-media-manage-panel.svelte';
  import type { EntityType, PexelsPhoto, TipexMediaItem } from '$lib/components/ui/tipex-media-modal.types';
  import { Button } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';
  import { getStandardImageUrl, STANDARD_IMAGE_SIZE_PRESETS, type StandardImageSizeKey } from '$lib/utils/image-sizes';
  export type { TipexMediaItem };

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
      <TipexMediaManagePanel
        media={editingMedia}
        bind:editAltText
        bind:editCaption
        {errorMessage}
        {successMessage}
        {formatDate}
        onBack={() => (editingMedia = null)}
        onSave={saveManagedMedia}
        onDelete={deleteManagedMedia}
      />
    {:else}
      <TipexMediaLibraryTabs
        bind:activeTab
        bind:selectedInsertSize
        bind:allQuery
        bind:pexelsQuery
        {pexelsEnabled}
        {errorMessage}
        {successMessage}
        {uploadInProgress}
        {uploadPercent}
        {loadingAttached}
        {loadingAll}
        {loadingPexels}
        {importInProgressId}
        {attachedItems}
        {allItems}
        {pexelsItems}
        attachmentIds={currentAttachments()}
        {formatDate}
        onUploadInputChange={event => {
          void onUploadInputChange(event);
        }}
        onSearchAll={() => {
          void loadAllItems();
        }}
        onSearchPexels={() => {
          void searchPexels();
        }}
        onManage={beginManage}
        onInsert={insertMedia}
        onImportPexels={item => {
          void importPexels(item);
        }}
      />
    {/if}
  </Dialog.Content>
</Dialog.Root>
