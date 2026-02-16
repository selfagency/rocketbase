# Media Management (Complete) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the media management system with multi-file upload, gallery creation, and advanced media organization.

**Architecture:** Extend existing media management with drag-drop multi-file upload, progressive image loading, media galleries, and advanced search/filtering.

**Tech Stack:** SvelteKit, PocketBase, shadcn-svelte (Dropzone, Dialog, Gallery), File API, Intersection Observer

---

## Overview

### User Stories

**As a content creator, I want to:**

- Upload multiple files at once via drag-and-drop
- See upload progress for each file
- Organize media into galleries
- Search and filter media by type, date, tags
- View media metadata (size, dimensions, upload date)
- Insert media into posts/pages easily
- Delete unused media with bulk actions

### Current State

**Media Collection:**

- Schema exists with basic fields
- Fields: `id`, `file`, `alt_text`, `caption`, `source`, `source_url`, `created`, `updated`
- Single file upload works
- Basic display in tipex media modal
- **NO MULTI-FILE UPLOAD**
- **NO GALLERIES**
- **NO ADVANCED FILTERING**

**Existing Files:**

- Media modal: `/Users/daniel/Developer/rocketbase/app/src/lib/components/ui/tipex-media-modal.svelte`
- Media library tabs: `/Users/daniel/Developer/rocketbase/app/src/lib/components/ui/tipex-media-library-tabs.svelte`
- Media manage panel: `/Users/daniel/Developer/rocketbase/app/src/lib/components/ui/tipex-media-manage-panel.svelte`

### Success Criteria

- ✅ Multi-file drag-and-drop upload
- ✅ Upload progress indicators
- ✅ Media galleries with categories
- ✅ Advanced search (name, type, date range)
- ✅ Bulk actions (delete, tag)
- ✅ Responsive image loading
- ✅ Tests: unit tests, E2E tests
- ✅ Documentation: user guide

---

## Research Phase

### Task 1: Review Current Media Implementation

**Files to Read:**

- `/Users/daniel/Developer/rocketbase/app/src/lib/components/ui/tipex-media-modal.svelte`
- `/Users/daniel/Developer/rocketbase/app/src/lib/components/ui/tipex-media-library-tabs.svelte`
- `/Users/daniel/Developer/rocketbase/app/src/lib/components/ui/tipex-media-manage-panel.svelte`
- `/Users/daniel/Developer/rocketbase/db/pb_migrations/` (media collection)

**Step 1: Read existing media modal**

Read: `/Users/daniel/Developer/rocketbase/app/src/lib/components/ui/tipex-media-modal.svelte`
Note: How upload currently works, UI structure, state management

**Step 2: Read media library component**

Read: `/Users/daniel/Developer/rocketbase/app/src/lib/components/ui/tipex-media-library-tabs.svelte`
Note: How media is displayed, search functionality, selection

**Step 3: Read media schema**

Search for media migration:

```bash
grep -r "media" db/pb_migrations/*.js
```

Note: Current fields, file storage, relationships

**Step 4: Document gaps**

Create: `docs/research/media-management-gaps.md`

Expected gaps:

- No multi-file upload
- No upload progress tracking
- No galleries or categorization
- Limited search/filter options
- No bulk operations

---

### Task 2: Research File Upload Patterns

**Step 1: Check File API support**

Research: Browser File API, FileReader, Progress events
Note: Compatibility, limitations, best practices

**Step 2: Review drag-and-drop libraries**

Options:

1. **Browser native** - Use HTML5 drag-drop events
2. **Uppy** - File uploader library
3. **Filepond** - Modern file upload component

Decision: Use **browser native** for lightweight implementation

**Step 3: Study PocketBase file upload**

Read PocketBase docs: File upload API, file validation, size limits
Note: How to upload multiple files, error handling

**Step 4: Design upload flow**

Create flow diagram:

```
User Action → File Selection/Drop → Validation → Upload Queue → Progress Display → Complete/Error
```

---

### Task 3: Design Gallery System

**Step 1: Define gallery schema**

Create: `app/src/lib/schemas/gallery.ts`

```typescript
import { z } from "zod";

export const gallerySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  media_ids: z.array(z.string()).min(1),
  featured_image: z.string().optional(),
  published: z.boolean().default(false),
});
```

**Step 2: Design gallery UI**

Wireframe:

- Grid view with responsive columns
- Gallery cards with cover image
- Modal to create/edit galleries
- Drag-to-reorder media within gallery

**Step 3: Plan database changes**

Evaluate options:

1. **New collection** - Create `galleries` collection
2. **Tags field** - Add tags to media collection
3. **Both** - Galleries + tags for flexibility

Decision: **Both** - galleries for formal collections, tags for flexible organization

---

## Development Phase

### Task 4: Implement Multi-File Upload

**Files:**

- Modify: `app/src/lib/components/ui/tipex-media-modal.svelte`
- Create: `app/src/lib/components/ui/media-dropzone.svelte`
- Create: `app/src/lib/components/ui/upload-progress.svelte`

**Step 1: Create dropzone component**

Create: `app/src/lib/components/ui/media-dropzone.svelte`

```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Button } from '$lib/components/ui/button';

  export let accept = 'image/*,video/*';
  export let maxSize = 10 * 1024 * 1024; // 10MB
  export let multiple = true;

  const dispatch = createEventDispatcher<{ filesSelected: File[] }>();

  let dragOver = false;
  let fileInput: HTMLInputElement;

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragOver = false;

    const files = Array.from(event.dataTransfer?.files || []);
    validateAndDispatch(files);
  }

  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files || []);
    validateAndDispatch(files);
  }

  function validateAndDispatch(files: File[]) {
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        console.warn(`File ${file.name} exceeds max size`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      dispatch('filesSelected', validFiles);
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    dragOver = true;
  }

  function handleDragLeave() {
    dragOver = false;
  }
</script>

<div
  class="border-2 border-dashed rounded-lg p-8 text-center transition-colors"
  class:border-primary={dragOver}
  class:bg-primary/5={dragOver}
  on:drop={handleDrop}
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  role="button"
  tabindex="0"
>
  <input
    bind:this={fileInput}
    type="file"
    {accept}
    {multiple}
    on:change={handleFileSelect}
    class="hidden"
  />

  <div class="space-y-4">
    <p class="text-lg font-medium">
      Drag and drop files here
    </p>
    <p class="text-sm text-muted-foreground">
      or
    </p>
    <Button on:click={() => fileInput.click()}>
      Browse Files
    </Button>
    <p class="text-xs text-muted-foreground">
      Max file size: {Math.round(maxSize / 1024 / 1024)}MB
    </p>
  </div>
</div>
```

**Step 2: Create upload progress component**

Create: `app/src/lib/components/ui/upload-progress.svelte`

```svelte
<script lang="ts">
  import { Progress } from '$lib/components/ui/progress';
  import { Button } from '$lib/components/ui/button';
  import { X } from 'lucide-svelte';

  export interface UploadItem {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'complete' | 'error';
    error?: string;
  }

  export let uploads: UploadItem[] = [];
  export let onCancel: (index: number) => void = () => {};
</script>

<div class="space-y-2">
  {#each uploads as upload, i}
    <div class="flex items-center gap-3 p-3 border rounded-lg">
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium truncate">{upload.file.name}</p>
        <div class="flex items-center gap-2 mt-1">
          <Progress value={upload.progress} class="flex-1" />
          <span class="text-xs text-muted-foreground whitespace-nowrap">
            {upload.progress}%
          </span>
        </div>
        {#if upload.error}
          <p class="text-xs text-destructive mt-1">{upload.error}</p>
        {/if}
      </div>

      {#if upload.status === 'uploading' || upload.status === 'pending'}
        <Button
          variant="ghost"
          size="icon"
          on:click={() => onCancel(i)}
        >
          <X class="h-4 w-4" />
        </Button>
      {/if}
    </div>
  {/each}
</div>
```

**Step 3: Implement upload manager**

Create: `app/src/lib/utils/upload-manager.ts`

```typescript
export interface UploadOptions {
  url: string;
  formData: FormData;
  onProgress?: (progress: number) => void;
}

export class UploadManager {
  private abortControllers = new Map<string, AbortController>();

  async upload({
    url,
    formData,
    onProgress,
  }: UploadOptions): Promise<Response> {
    const controller = new AbortController();
    const uploadId = crypto.randomUUID();
    this.abortControllers.set(uploadId, controller);

    try {
      const xhr = new XMLHttpRequest();

      // Track progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      // Setup abort handling
      controller.signal.addEventListener("abort", () => {
        xhr.abort();
      });

      return new Promise((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(new Response(xhr.response, { status: xhr.status }));
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });

        xhr.addEventListener("abort", () => {
          reject(new Error("Upload cancelled"));
        });

        xhr.open("POST", url);
        xhr.send(formData);
      });
    } finally {
      this.abortControllers.delete(uploadId);
    }
  }

  cancelAll() {
    for (const controller of this.abortControllers.values()) {
      controller.abort();
    }
    this.abortControllers.clear();
  }
}
```

**Step 4: Integrate into media modal**

Modify: `app/src/lib/components/ui/tipex-media-modal.svelte`

```svelte
<script lang="ts">
  import MediaDropzone from './media-dropzone.svelte';
  import UploadProgress from './upload-progress.svelte';
  import { UploadManager } from '$lib/utils/upload-manager';
  import type { UploadItem } from './upload-progress.svelte';

  let uploads: UploadItem[] = [];
  const uploadManager = new UploadManager();

  async function handleFilesSelected(event: CustomEvent<File[]>) {
    const files = event.detail;

    // Add to upload queue
    const newUploads: UploadItem[] = files.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const,
    }));

    uploads = [...uploads, ...newUploads];

    // Upload files sequentially
    for (let i = 0; i < newUploads.length; i++) {
      const upload = newUploads[i];
      const uploadIndex = uploads.indexOf(upload);

      try {
        uploads[uploadIndex].status = 'uploading';

        const formData = new FormData();
        formData.append('file', upload.file);

        await uploadManager.upload({
          url: '/api/admin/media',
          formData,
          onProgress: (progress) => {
            uploads[uploadIndex].progress = progress;
          },
        });

        uploads[uploadIndex].status = 'complete';
        uploads[uploadIndex].progress = 100;
      } catch (error) {
        uploads[uploadIndex].status = 'error';
        uploads[uploadIndex].error = error.message;
      }
    }

    // Refresh media library after uploads complete
    await refreshMediaLibrary();
  }

  function handleCancelUpload(index: number) {
    // Remove from queue if pending/uploading
    uploads = uploads.filter((_, i) => i !== index);
  }
</script>

<!-- Existing modal content -->

<MediaDropzone on:filesSelected={handleFilesSelected} />

{#if uploads.length > 0}
  <div class="mt-4">
    <h3 class="text-sm font-medium mb-2">Uploads</h3>
    <UploadProgress {uploads} onCancel={handleCancelUpload} />
  </div>
{/if}
```

**Step 5: Test multi-file upload**

Run: `cd app && pnpm dev`
Action: Drag multiple images to dropzone
Expected: All files upload with progress indicators

**Step 6: Commit multi-file upload**

Run:

```bash
git add app/src/lib/components/ui/media-dropzone.svelte
git add app/src/lib/components/ui/upload-progress.svelte
git add app/src/lib/utils/upload-manager.ts
git add app/src/lib/components/ui/tipex-media-modal.svelte
git commit -m "feat: add multi-file drag-drop upload (bean-<id>)"
```

---

### Task 5: Add Media Tags and Categories

**Files:**

- Modify: Media collection schema (migration)
- Create: `app/src/lib/components/ui/media-tag-input.svelte`

**Step 1: Create migration for tags**

Create: `db/pb_migrations/XXXXXX_add_media_tags.js`

```javascript
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("media");

  // Add tags field
  collection.schema.addField(
    new SchemaField({
      name: "tags",
      type: "json",
      required: false,
    })
  );

  // Add category field
  collection.schema.addField(
    new SchemaField({
      name: "category",
      type: "select",
      required: false,
      options: {
        values: ["image", "video", "document", "other"],
      },
    })
  );

  return dao.saveCollection(collection);
});
```

**Step 2: Run migration**

Run: `cd db && pocketbase migrate`
Expected: Migration applied, fields added

**Step 3: Create tag input component**

Create: `app/src/lib/components/ui/media-tag-input.svelte`

```svelte
<script lang="ts">
  import { Badge } from '$lib/components/ui/badge';
  import { Input } from '$lib/components/ui/input';
  import { X } from 'lucide-svelte';

  export let tags: string[] = [];

  let inputValue = '';

  function addTag() {
    const tag = inputValue.trim();
    if (tag && !tags.includes(tag)) {
      tags = [...tags, tag];
      inputValue = '';
    }
  }

  function removeTag(tag: string) {
    tags = tags.filter(t => t !== tag);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      addTag();
    } else if (event.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }
</script>

<div class="space-y-2">
  <div class="flex flex-wrap gap-2">
    {#each tags as tag}
      <Badge variant="secondary" class="flex items-center gap-1">
        {tag}
        <button
          type="button"
          on:click={() => removeTag(tag)}
          class="hover:bg-secondary-foreground/20 rounded-full p-0.5"
        >
          <X class="h-3 w-3" />
        </button>
      </Badge>
    {/each}
  </div>

  <Input
    bind:value={inputValue}
    on:keydown={handleKeydown}
    on:blur={addTag}
    placeholder="Add tags..."
  />
</div>
```

**Step 4: Integrate tags into media manager**

Modify: `app/src/lib/components/ui/tipex-media-manage-panel.svelte`

Add tag input to media edit form

**Step 5: Commit tag system**

Run:

```bash
git add db/pb_migrations/
git add app/src/lib/components/ui/media-tag-input.svelte
git commit -m "feat: add media tags and categories (bean-<id>)"
```

---

### Task 6: Implement Advanced Search and Filtering

**Files:**

- Modify: `app/src/lib/components/ui/tipex-media-library-tabs.svelte`
- Create: `app/src/lib/components/ui/media-filters.svelte`

**Step 1: Create filters component**

Create: `app/src/lib/components/ui/media-filters.svelte`

```svelte
<script lang="ts">
  import { Input } from '$lib/components/ui/input';
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select';
  import { createEventDispatcher } from 'svelte';

  export let search = '';
  export let category = '';
  export let sortBy = 'created';
  export let sortOrder = 'desc';

  const dispatch = createEventDispatcher<{
    change: { search: string; category: string; sortBy: string; sortOrder: string };
  }>();

  $: dispatch('change', { search, category, sortBy, sortOrder });
</script>

<div class="flex flex-wrap gap-4">
  <Input
    type="search"
    placeholder="Search media..."
    bind:value={search}
    class="max-w-xs"
  />

  <Select bind:value={category}>
    <SelectTrigger class="w-40">
      <SelectValue placeholder="All types" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="">All types</SelectItem>
      <SelectItem value="image">Images</SelectItem>
      <SelectItem value="video">Videos</SelectItem>
      <SelectItem value="document">Documents</SelectItem>
      <SelectItem value="other">Other</SelectItem>
    </SelectContent>
  </Select>

  <Select bind:value={sortBy}>
    <SelectTrigger class="w-40">
      <SelectValue placeholder="Sort by" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="created">Date uploaded</SelectItem>
      <SelectItem value="file">Filename</SelectItem>
      <SelectItem value="alt_text">Alt text</SelectItem>
    </SelectContent>
  </Select>

  <Select bind:value={sortOrder}>
    <SelectTrigger class="w-32">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="desc">Newest first</SelectItem>
      <SelectItem value="asc">Oldest first</SelectItem>
    </SelectContent>
  </Select>
</div>
```

**Step 2: Integrate filters**

Modify media library to use filters component and apply filtering logic

**Step 3: Commit advanced filtering**

Run:

```bash
git add app/src/lib/components/ui/media-filters.svelte
git commit -m "feat: add advanced media search and filtering (bean-<id>)"
```

---

## Testing Phase

### Task 7: Write E2E Tests

**Files:**

- Create: `app/tests/e2e/media-management.spec.ts`

**Step 1: Write multi-file upload test**

```typescript
import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Media Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');
  });

  test("can upload multiple files", async ({ page }) => {
    await page.goto("/admin/posts/new");

    // Open media modal
    await page.click('[data-testid="media-button"]');

    // Upload files
    const file1 = path.join(__dirname, "../fixtures/image1.jpg");
    const file2 = path.join(__dirname, "../fixtures/image2.jpg");

    await page.setInputFiles('input[type="file"]', [file1, file2]);

    // Should see upload progress
    await expect(page.locator("text=image1.jpg")).toBeVisible();
    await expect(page.locator("text=image2.jpg")).toBeVisible();

    // Wait for uploads to complete
    await expect(page.locator("text=100%")).toBeVisible({ timeout: 10000 });

    // Files should appear in library
    await page.click("text=Library");
    await expect(page.locator('img[alt*="image1"]')).toBeVisible();
    await expect(page.locator('img[alt*="image2"]')).toBeVisible();
  });

  test("can add tags to media", async ({ page }) => {
    await page.goto("/admin/posts/new");
    await page.click('[data-testid="media-button"]');
    await page.click("text=Library");

    // Select first image
    await page.click("img").first();

    // Add tags
    await page.fill('input[placeholder="Add tags..."]', "landscape");
    await page.keyboard.press("Enter");
    await page.fill('input[placeholder="Add tags..."]', "nature");
    await page.keyboard.press("Enter");

    // Save
    await page.click('button:has-text("Save")');

    // Should see tags
    await expect(page.locator("text=landscape")).toBeVisible();
    await expect(page.locator("text=nature")).toBeVisible();
  });

  test("can filter media by category", async ({ page }) => {
    await page.goto("/admin/posts/new");
    await page.click('[data-testid="media-button"]');

    // Select images filter
    await page.click('[data-testid="category-filter"]');
    await page.click("text=Images");

    // Should only show images
    const mediaItems = await page.locator("[data-media-type]").all();
    for (const item of mediaItems) {
      const type = await item.getAttribute("data-media-type");
      expect(type).toBe("image");
    }
  });
});
```

**Step 2: Run E2E tests**

Run: `cd app && pnpm test:e2e media-management.spec.ts`
Expected: All tests pass

**Step 3: Commit E2E tests**

Run:

```bash
git add app/tests/e2e/media-management.spec.ts
git add app/tests/fixtures/
git commit -m "test: add media management E2E tests (bean-<id>)"
```

---

## Documentation Phase

### Task 8: Write User Documentation

**Files:**

- Create: `docs/user-guide/media-management.md`

**Step 1: Write media guide**

```markdown
# Media Management Guide

## Uploading Media

### Single File Upload

1. Click **Browse Files** button
2. Select a file from your computer
3. Click **Open**
4. Wait for upload to complete

### Multiple File Upload

1. **Drag and drop**: Drag multiple files from your computer directly into the dropzone
2. **Browse**: Click **Browse Files** and select multiple files (Ctrl/Cmd + Click)
3. Monitor upload progress for each file

**Supported formats:**

- Images: JPG, PNG, GIF, WebP, SVG
- Videos: MP4, WebM, MOV
- Documents: PDF

**File size limit:** 10MB per file

## Organizing Media

### Adding Tags

Tags help categorize and find media quickly.

1. Select a media item
2. Type a tag in the **Add tags** field
3. Press **Enter** to add
4. Repeat for additional tags
5. Click **Save**

**Tips:**

- Use consistent tag names
- Create a tag hierarchy (e.g., "nature-landscape", "nature-wildlife")
- Tags are searchable

### Setting Categories

Categories provide broad organization:

- **Image**: Photos, illustrations, graphics
- **Video**: Video files
- **Document**: PDFs and other documents
- **Other**: Everything else

## Finding Media

### Search

Type in the search box to find media by:

- Filename
- Alt text
- Caption
- Tags

### Filtering

Use the filter dropdowns to narrow results:

- **Type**: Filter by category (images, videos, etc.)
- **Sort**: Order by upload date, filename, or alt text
- **Direction**: Newest or oldest first

## Best Practices

1. **Always add alt text** for accessibility
2. **Use descriptive filenames** before uploading
3. **Tag consistently** for easy retrieval
4. **Delete unused media** to save storage
5. **Optimize images** before uploading for faster loading
```

**Step 2: Commit documentation**

Run:

```bash
git add docs/user-guide/media-management.md
git commit -m "docs: add media management user guide (bean-<id>)"
```

---

## Completion Checklist

- [ ] Multi-file upload implemented
- [ ] Upload progress tracking working
- [ ] Tags and categories added
- [ ] Advanced search and filtering working
- [ ] E2E tests passing
- [ ] User documentation complete
- [ ] All commits include bean ID
- [ ] Quality gates passed (lint, test, build)

---

## Follow-Up Tasks

**Future Enhancements:**

- Image editing (crop, resize, filters)
- Media galleries collection
- CDN integration for optimized delivery
- Image optimization on upload
- Duplicate detection
- Bulk delete and tag operations
- Media usage tracking (where used)
- External media sources (Unsplash, Pexels integration exists)

**Dependencies for Other Features:**

- Posts/Pages will reference media via galleries
- Newsletters will use media library
- Shop will need product images
