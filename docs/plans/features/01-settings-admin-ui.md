# Settings Admin UI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a comprehensive admin interface for managing site-wide metadata and URL redirects.

**Architecture:** Server-side data loading with client-side form validation using sveltekit-superforms + Zod. Group-based tabbed interface for metadata, with separate page for redirect management.

**Tech Stack:** SvelteKit, sveltekit-superforms, Zod, shadcn-svelte (Tabs, Form, Input, Textarea, Switch), PocketBase

---

## Overview

### User Stories

**As an admin, I want to:**

- View and edit all site metadata (title, description, social handles, etc.)
- Organize metadata by category (General, Social Media, IndieWeb, Customization)
- Manage URL redirects (create, update, delete)
- See validation errors when entering invalid data
- Have changes save immediately with visual feedback

### Current State

**Metadata Collection:**

- Schema exists with 14 default entries (migration `1770001000_consolidated_metadata.js`)
- Fields: `id`, `key`, `nice_name`, `value`, `type`, `description`, `group`, `updated`
- Types: `string`, `integer`, `float`, `json`, `boolean`, `code`
- Groups: `general`, `editing`, `social_media`, `indieweb`, `customization`, `other`
- **NO ADMIN UI EXISTS** - must edit via PocketBase admin panel

**Redirects Collection:**

- Schema exists but unused
- **NO ADMIN UI EXISTS**

**Files to Reference:**

- Schema: `/Users/daniel/Developer/rocketbase/db/pb_migrations/1770001000_consolidated_metadata.js`
- Types: `/Users/daniel/Developer/rocketbase/app/src/lib/types/pocketbase.d.ts`
- Metadata usage: `/Users/daniel/Developer/rocketbase/app/src/routes/+layout.server.ts`

### Success Criteria

- ✅ Metadata editing UI with group-based tabs
- ✅ Form validation for each metadata type
- ✅ Immediate save with toast notifications
- ✅ Redirect CRUD interface with validation
- ✅ Accessibility: keyboard navigation, screen reader support
- ✅ Tests: unit tests for validators, E2E tests for workflows
- ✅ Documentation: admin user guide

---

## Research Phase

### Task 1: Review Existing Patterns

**Files to Read:**

- `/Users/daniel/Developer/rocketbase/app/src/routes/admin/pages/+page.svelte` - Admin list pattern
- `/Users/daniel/Developer/rocketbase/app/src/lib/components/admin/pages/page-form.svelte` - Form pattern
- `/Users/daniel/Developer/rocketbase/app/src/lib/schemas/page.ts` - Zod schema pattern
- `/Users/daniel/Developer/rocketbase/app/src/routes/admin/posts/+page.server.ts` - Server load pattern

**Step 1: Read admin page list**
Read: `/Users/daniel/Developer/rocketbase/app/src/routes/admin/pages/+page.svelte`
Note: Table structure, search, pagination patterns

**Step 2: Read page form component**
Read: `/Users/daniel/Developer/rocketbase/app/src/lib/components/admin/pages/page-form.svelte`
Note: superForm usage, field binding, validation display

**Step 3: Read Zod schema**
Read: `/Users/daniel/Developer/rocketbase/app/src/lib/schemas/page.ts`
Note: Schema structure, validation rules, optional vs required

**Step 4: Read server load function**
Read: `/Users/daniel/Developer/rocketbase/app/src/routes/admin/posts/+page.server.ts`
Note: PocketBase query patterns, error handling

**Step 5: Document patterns**
Create: `docs/research/settings-admin-patterns.md`
Document reusable patterns identified

---

### Task 2: Check shadcn-svelte Components

**Required Components:**

- Tabs (for grouped metadata)
- Form (field wrapper)
- Input (text, number)
- Textarea (long text, code)
- Switch (boolean)
- Label
- Button
- Table (for redirects)

**Step 1: Verify Tabs component exists**

Run: `pnpx shadcn-svelte@latest add tabs`
Expected: Component added to `app/src/lib/components/ui/tabs/`

**Step 2: Verify Form components exist**

Run: `pnpx shadcn-svelte@latest add form label input textarea switch button`
Expected: All components available

**Step 3: Test Tabs with reactive data**

Create test file: `app/src/routes/admin/settings/test-tabs.svelte`
Test: Tab switching with form state preservation

**Step 4: Remove test file**

Run: `rm app/src/routes/admin/settings/test-tabs.svelte`

---

### Task 3: Explore Metadata Schema

**Step 1: Read migration file**

Read: `/Users/daniel/Developer/rocketbase/db/pb_migrations/1770001000_consolidated_metadata.js`
Note: Exact field names, types, constraints

**Step 2: Read TypeScript types**

Read: `/Users/daniel/Developer/rocketbase/app/src/lib/types/pocketbase.d.ts`
Note: `MetadataRecord`, `MetadataResponse`, enum types

**Step 3: Read default metadata**

Read: `/Users/daniel/Developer/rocketbase/db/pb_migrations/1771043492_populate_default_metadata.js`
Note: All 14 default entries, their keys, types, groups

**Step 4: Map metadata by group**

Create mapping document:

```typescript
{
  general: ['site_title', 'site_description', 'site_logo', 'og_image'],
  editing: ['admin_posts_per_page', 'posts_per_page', 'revisions_kept'],
  social_media: ['bluesky_handle'],
  indieweb: ['fediverse_handle', 'fediverse_username'],
  customization: ['custom_css', 'js_tags', 'cdn_url'],
  other: ['comments_enabled']
}
```

---

### Task 4: Design Form Validation Rules

**Step 1: Define metadata validation schema**

Create: `app/src/lib/schemas/metadata.ts`

```typescript
import { z } from "zod";
import { MetadataTypeOptions } from "$lib/types/pocketbase";

export const metadataUpdateSchema = z
  .object({
    id: z.string().min(15),
    key: z.string().min(1),
    value: z.string().optional(),
    type: z.nativeEnum(MetadataTypeOptions),
    nice_name: z.string().optional(),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      // Type-specific validation
      if (data.type === "integer" && data.value) {
        return !isNaN(parseInt(data.value, 10));
      }
      if (data.type === "float" && data.value) {
        return !isNaN(parseFloat(data.value));
      }
      if (data.type === "boolean" && data.value) {
        return data.value === "true" || data.value === "false";
      }
      if (data.type === "json" && data.value) {
        try {
          JSON.parse(data.value);
          return true;
        } catch {
          return false;
        }
      }
      return true;
    },
    {
      message: "Invalid value for specified type",
    }
  );
```

**Step 2: Define redirect validation schema**

Create: `app/src/lib/schemas/redirect.ts`

```typescript
import { z } from "zod";

export const redirectSchema = z.object({
  from_path: z.string().min(1).regex(/^\//, "Must start with /"),
  to_path: z
    .string()
    .min(1)
    .url()
    .or(z.string().regex(/^\//, "Must be URL or path starting with /")),
  status_code: z.number().int().min(301).max(308),
  permanent: z.boolean().default(true),
});
```

**Step 3: Write validation tests**

Create: `app/src/lib/schemas/metadata.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { metadataUpdateSchema } from "./metadata";

describe("metadataUpdateSchema", () => {
  it("validates integer type", () => {
    const result = metadataUpdateSchema.safeParse({
      id: "123456789012345",
      key: "test",
      type: "integer",
      value: "42",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid integer", () => {
    const result = metadataUpdateSchema.safeParse({
      id: "123456789012345",
      key: "test",
      type: "integer",
      value: "not a number",
    });
    expect(result.success).toBe(false);
  });

  it("validates JSON type", () => {
    const result = metadataUpdateSchema.safeParse({
      id: "123456789012345",
      key: "test",
      type: "json",
      value: '{"valid": true}',
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid JSON", () => {
    const result = metadataUpdateSchema.safeParse({
      id: "123456789012345",
      key: "test",
      type: "json",
      value: "{invalid json",
    });
    expect(result.success).toBe(false);
  });
});
```

**Step 4: Run validation tests**

Run: `cd app && pnpm test metadata.test.ts`
Expected: All tests pass

---

## Development Phase

### Task 5: Create Settings Route Structure

**Files:**

- Create: `app/src/routes/admin/settings/+page.svelte`
- Create: `app/src/routes/admin/settings/+page.server.ts`
- Create: `app/src/routes/admin/settings/metadata/+page.svelte`
- Create: `app/src/routes/admin/settings/metadata/+page.server.ts`
- Create: `app/src/routes/admin/settings/redirects/+page.svelte`
- Create: `app/src/routes/admin/settings/redirects/+page.server.ts`

**Step 1: Create settings index route**

Create: `app/src/routes/admin/settings/+page.svelte`

```svelte
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Card } from '$lib/components/ui/card';
</script>

<div class="container mx-auto py-8">
  <h1 class="text-3xl font-bold mb-8">Settings</h1>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Card.Root>
      <Card.Header>
        <Card.Title>Site Metadata</Card.Title>
        <Card.Description>
          Manage site title, description, social media handles, and more.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <Button href="/admin/settings/metadata">Manage Metadata</Button>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header>
        <Card.Title>URL Redirects</Card.Title>
        <Card.Description>
          Create and manage URL redirects for changed or moved content.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <Button href="/admin/settings/redirects">Manage Redirects</Button>
      </Card.Content>
    </Card.Root>
  </div>
</div>
```

**Step 2: Test settings index loads**

Run: `cd app && pnpm dev`
Navigate: `http://localhost:5173/admin/settings`
Expected: Two cards visible with buttons

**Step 3: Commit settings index**

Run:

```bash
git add app/src/routes/admin/settings/+page.svelte
git commit -m "feat: add settings index page (bean-<id>)"
```

---

### Task 6: Implement Metadata Server Load

**Files:**

- Create: `app/src/routes/admin/settings/metadata/+page.server.ts`

**Step 1: Write server load function**

```typescript
import type { PageServerLoad } from "./$types";
import { pb } from "$lib/server/pocketbase";
import type {
  MetadataResponse,
  MetadataGroupOptions,
} from "$lib/types/pocketbase";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals }) => {
  // Check admin auth
  if (!locals.user || locals.user.role !== "admin") {
    throw error(403, "Admin access required");
  }

  try {
    const metadata = await pb
      .collection("metadata")
      .getFullList<MetadataResponse>({
        sort: "group,key",
      });

    // Group metadata by category
    const groupedMetadata: Record<MetadataGroupOptions, MetadataResponse[]> = {
      general: [],
      editing: [],
      social_media: [],
      indieweb: [],
      customization: [],
      other: [],
    };

    for (const item of metadata) {
      const group = item.group || "other";
      if (group in groupedMetadata) {
        groupedMetadata[group].push(item);
      }
    }

    return {
      groupedMetadata,
    };
  } catch (err) {
    console.error("Failed to load metadata:", err);
    throw error(500, "Failed to load settings");
  }
};
```

**Step 2: Test server load**

Create: `app/src/routes/admin/settings/metadata/+page.svelte` (temporary)

```svelte
<script lang="ts">
  export let data;
</script>

<pre>{JSON.stringify(data, null, 2)}</pre>
```

Run: Navigate to `/admin/settings/metadata`
Expected: JSON dump of grouped metadata

**Step 3: Commit server load**

Run:

```bash
git add app/src/routes/admin/settings/metadata/+page.server.ts
git commit -m "feat: add metadata server load function (bean-<id>)"
```

---

### Task 7: Implement Metadata Update Actions

**Files:**

- Modify: `app/src/routes/admin/settings/metadata/+page.server.ts`

**Step 1: Add update action**

```typescript
import type { Actions } from "./$types";
import { superValidate } from "sveltekit-superforms/server";
import { zod4 } from "sveltekit-superforms/adapters";
import { metadataUpdateSchema } from "$lib/schemas/metadata";
import { fail } from "@sveltejs/kit";

export const actions: Actions = {
  updateMetadata: async ({ request, locals }) => {
    if (!locals.user || locals.user.role !== "admin") {
      return fail(403, { message: "Admin access required" });
    }

    const form = await superValidate(request, zod4(metadataUpdateSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      await pb.collection("metadata").update(form.data.id, {
        value: form.data.value,
        nice_name: form.data.nice_name,
        description: form.data.description,
      });

      return { form, success: true };
    } catch (err) {
      console.error("Failed to update metadata:", err);
      return fail(500, { form, message: "Failed to update metadata" });
    }
  },
};
```

**Step 2: Write action tests**

Create: `app/src/routes/admin/settings/metadata/+page.server.test.ts`

```typescript
import { describe, it, expect, vi } from "vitest";
import { actions } from "./+page.server";

describe("metadata actions", () => {
  it("rejects non-admin users", async () => {
    const result = await actions.updateMetadata({
      request: new Request("http://test", { method: "POST" }),
      locals: { user: { role: "user" } },
    });

    expect(result.status).toBe(403);
  });

  // More tests...
});
```

**Step 3: Run tests**

Run: `cd app && pnpm test +page.server.test.ts`
Expected: Tests pass

**Step 4: Commit actions**

Run:

```bash
git add app/src/routes/admin/settings/metadata/+page.server.ts
git add app/src/routes/admin/settings/metadata/+page.server.test.ts
git commit -m "feat: add metadata update actions (bean-<id>)"
```

---

### Task 8: Build Metadata Form Component

**Files:**

- Create: `app/src/lib/components/admin/settings/metadata-form.svelte`

**Step 1: Write metadata form component**

```svelte
<script lang="ts">
  import { superForm } from 'sveltekit-superforms/client';
  import { zod4 } from 'sveltekit-superforms/adapters';
  import { metadataUpdateSchema } from '$lib/schemas/metadata';
  import { toast } from 'svelte-sonner';
  import { Input } from '$lib/components/ui/input';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Switch } from '$lib/components/ui/switch';
  import { Label } from '$lib/components/ui/label';
  import { Button } from '$lib/components/ui/button';
  import type { MetadataResponse } from '$lib/types/pocketbase';

  export let metadata: MetadataResponse;

  const { form, errors, enhance, delayed } = superForm(
    { id: metadata.id, key: metadata.key, value: metadata.value || '', type: metadata.type },
    {
      validators: zod4(metadataUpdateSchema),
      resetForm: false,
      onUpdated: ({ form }) => {
        if (form.valid) {
          toast.success('Settings saved');
        } else {
          toast.error('Validation failed');
        }
      },
    }
  );
</script>

<form method="POST" action="?/updateMetadata" use:enhance class="space-y-4">
  <input type="hidden" name="id" value={metadata.id} />
  <input type="hidden" name="key" value={metadata.key} />
  <input type="hidden" name="type" value={metadata.type} />

  <div>
    <Label for={metadata.key}>{metadata.nice_name || metadata.key}</Label>
    {#if metadata.description}
      <p class="text-sm text-muted-foreground">{metadata.description}</p>
    {/if}

    {#if metadata.type === 'boolean'}
      <Switch id={metadata.key} bind:checked={$form.value} name="value" />
    {:else if metadata.type === 'code' || metadata.type === 'json'}
      <Textarea
        id={metadata.key}
        name="value"
        bind:value={$form.value}
        class="font-mono text-sm"
        rows={10}
      />
    {:else if metadata.type === 'integer' || metadata.type === 'float'}
      <Input
        id={metadata.key}
        name="value"
        type="number"
        bind:value={$form.value}
        step={metadata.type === 'float' ? '0.01' : '1'}
      />
    {:else}
      <Input
        id={metadata.key}
        name="value"
        bind:value={$form.value}
      />
    {/if}

    {#if $errors.value}
      <p class="text-sm text-destructive">{$errors.value}</p>
    {/if}
  </div>

  <Button type="submit" disabled={$delayed}>
    {$delayed ? 'Saving...' : 'Save'}
  </Button>
</form>
```

**Step 2: Write component tests**

Create: `app/src/lib/components/admin/settings/metadata-form.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import MetadataForm from "./metadata-form.svelte";

describe("MetadataForm", () => {
  it("renders text input for string type", () => {
    render(MetadataForm, {
      props: {
        metadata: {
          id: "123",
          key: "site_title",
          nice_name: "Site Title",
          value: "Test",
          type: "string",
        },
      },
    });

    const input = screen.getByLabelText("Site Title");
    expect(input).toBeInTheDocument();
    expect(input.getAttribute("type")).toBe("text");
  });

  it("renders switch for boolean type", () => {
    render(MetadataForm, {
      props: {
        metadata: {
          id: "123",
          key: "comments_enabled",
          nice_name: "Enable Comments",
          value: "true",
          type: "boolean",
        },
      },
    });

    const toggle = screen.getByRole("switch");
    expect(toggle).toBeInTheDocument();
  });

  // More tests...
});
```

**Step 3: Run component tests**

Run: `cd app && pnpm test metadata-form.test.ts`
Expected: All tests pass

**Step 4: Commit metadata form**

Run:

```bash
git add app/src/lib/components/admin/settings/metadata-form.svelte
git add app/src/lib/components/admin/settings/metadata-form.test.ts
git commit -m "feat: add metadata form component (bean-<id>)"
```

---

### Task 9: Build Metadata Page with Tabs

**Files:**

- Modify: `app/src/routes/admin/settings/metadata/+page.svelte`

**Step 1: Write metadata page**

```svelte
<script lang="ts">
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
  import MetadataForm from '$lib/components/admin/settings/metadata-form.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  const groupLabels = {
    general: 'General',
    editing: 'Editing',
    social_media: 'Social Media',
    indieweb: 'IndieWeb',
    customization: 'Customization',
    other: 'Other',
  };
</script>

<div class="container mx-auto py-8">
  <h1 class="text-3xl font-bold mb-8">Site Metadata</h1>

  <Tabs value="general" class="space-y-4">
    <TabsList>
      {#each Object.keys(data.groupedMetadata) as group}
        {#if data.groupedMetadata[group].length > 0}
          <TabsTrigger value={group}>
            {groupLabels[group]}
          </TabsTrigger>
        {/if}
      {/each}
    </TabsList>

    {#each Object.entries(data.groupedMetadata) as [group, items]}
      {#if items.length > 0}
        <TabsContent value={group} class="space-y-6">
          {#each items as metadata}
            <div class="border rounded-lg p-4">
              <MetadataForm {metadata} />
            </div>
          {/each}
        </TabsContent>
      {/if}
    {/each}
  </Tabs>
</div>
```

**Step 2: Test metadata page**

Run: Navigate to `/admin/settings/metadata`
Expected: Tabbed interface with metadata grouped by category

**Step 3: Test form submission**

Action: Change a value and click "Save"
Expected: Toast notification "Settings saved"

**Step 4: Verify database update**

Run: Check PocketBase admin panel
Expected: Value updated in database

**Step 5: Commit metadata page**

Run:

```bash
git add app/src/routes/admin/settings/metadata/+page.svelte
git commit -m "feat: add metadata management page (bean-<id>)"
```

---

### Task 10: Implement Redirects CRUD

**Files:**

- Create: `app/src/routes/admin/settings/redirects/+page.server.ts`
- Create: `app/src/routes/admin/settings/redirects/+page.svelte`
- Create: `app/src/lib/components/admin/settings/redirect-form.svelte`

**Step 1: Create redirect schema and types**

Already created in Task 4, Step 2

**Step 2: Write redirects server load**

Create: `app/src/routes/admin/settings/redirects/+page.server.ts`

```typescript
import type { PageServerLoad, Actions } from "./$types";
import { pb } from "$lib/server/pocketbase";
import { superValidate } from "sveltekit-superforms/server";
import { zod4 } from "sveltekit-superforms/adapters";
import { redirectSchema } from "$lib/schemas/redirect";
import { error, fail } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user || locals.user.role !== "admin") {
    throw error(403, "Admin access required");
  }

  try {
    const redirects = await pb.collection("redirects").getFullList({
      sort: "from_path",
    });

    const form = await superValidate(zod4(redirectSchema));

    return {
      redirects,
      form,
    };
  } catch (err) {
    console.error("Failed to load redirects:", err);
    throw error(500, "Failed to load redirects");
  }
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    if (!locals.user || locals.user.role !== "admin") {
      return fail(403, { message: "Admin access required" });
    }

    const form = await superValidate(request, zod4(redirectSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      await pb.collection("redirects").create(form.data);
      return { form, success: true };
    } catch (err) {
      console.error("Failed to create redirect:", err);
      return fail(500, { form, message: "Failed to create redirect" });
    }
  },

  delete: async ({ request, locals }) => {
    if (!locals.user || locals.user.role !== "admin") {
      return fail(403, { message: "Admin access required" });
    }

    const formData = await request.formData();
    const id = formData.get("id")?.toString();

    if (!id) {
      return fail(400, { message: "Redirect ID required" });
    }

    try {
      await pb.collection("redirects").delete(id);
      return { success: true };
    } catch (err) {
      console.error("Failed to delete redirect:", err);
      return fail(500, { message: "Failed to delete redirect" });
    }
  },
};
```

**Step 3: Write redirects page**

Create: `app/src/routes/admin/settings/redirects/+page.svelte`

```svelte
<script lang="ts">
  import { superForm } from 'sveltekit-superforms/client';
  import { zod4 } from 'sveltekit-superforms/adapters';
  import { redirectSchema } from '$lib/schemas/redirect';
  import { toast } from 'svelte-sonner';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  import type { PageData } from './$types';

  export let data: PageData;

  const { form, errors, enhance, delayed } = superForm(data.form, {
    validators: zod4(redirectSchema),
    resetForm: true,
    onUpdated: ({ form }) => {
      if (form.valid) {
        toast.success('Redirect created');
      }
    },
  });
</script>

<div class="container mx-auto py-8">
  <h1 class="text-3xl font-bold mb-8">URL Redirects</h1>

  <div class="mb-8 border rounded-lg p-6">
    <h2 class="text-xl font-semibold mb-4">Add New Redirect</h2>
    <form method="POST" action="?/create" use:enhance class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <Label for="from_path">From Path</Label>
          <Input
            id="from_path"
            name="from_path"
            bind:value={$form.from_path}
            placeholder="/old-path"
          />
          {#if $errors.from_path}
            <p class="text-sm text-destructive">{$errors.from_path}</p>
          {/if}
        </div>

        <div>
          <Label for="to_path">To Path</Label>
          <Input
            id="to_path"
            name="to_path"
            bind:value={$form.to_path}
            placeholder="/new-path"
          />
          {#if $errors.to_path}
            <p class="text-sm text-destructive">{$errors.to_path}</p>
          {/if}
        </div>
      </div>

      <Button type="submit" disabled={$delayed}>
        {$delayed ? 'Creating...' : 'Create Redirect'}
      </Button>
    </form>
  </div>

  <div>
    <h2 class="text-xl font-semibold mb-4">Existing Redirects</h2>
    {#if data.redirects.length === 0}
      <p class="text-muted-foreground">No redirects configured.</p>
    {:else}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each data.redirects as redirect}
            <TableRow>
              <TableCell>{redirect.from_path}</TableCell>
              <TableCell>{redirect.to_path}</TableCell>
              <TableCell>{redirect.status_code}</TableCell>
              <TableCell class="text-right">
                <form method="POST" action="?/delete" class="inline">
                  <input type="hidden" name="id" value={redirect.id} />
                  <Button type="submit" variant="destructive" size="sm">
                    Delete
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          {/each}
        </TableBody>
      </Table>
    {/if}
  </div>
</div>
```

**Step 4: Test redirect creation**

Run: Navigate to `/admin/settings/redirects`
Action: Create a test redirect
Expected: Redirect appears in table, toast shows success

**Step 5: Test redirect deletion**

Action: Delete the test redirect
Expected: Redirect removed from table

**Step 6: Commit redirects page**

Run:

```bash
git add app/src/routes/admin/settings/redirects/
git add app/src/lib/schemas/redirect.ts
git commit -m "feat: add redirects management page (bean-<id>)"
```

---

## Testing Phase

### Task 11: Write E2E Tests

**Files:**

- Create: `app/tests/e2e/admin-settings.spec.ts`

**Step 1: Write metadata E2E test**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Admin Settings - Metadata", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/login");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/");
  });

  test("can view and update metadata", async ({ page }) => {
    await page.goto("/admin/settings/metadata");

    // Should see tabs
    await expect(page.locator("text=General")).toBeVisible();
    await expect(page.locator("text=Social Media")).toBeVisible();

    // Click General tab
    await page.click("text=General");

    // Update site title
    const titleInput = page.locator('input[name="value"]').first();
    await titleInput.fill("Updated Site Title");
    await page.click('button:has-text("Save")');

    // Should see success toast
    await expect(page.locator("text=Settings saved")).toBeVisible();

    // Refresh and verify persistence
    await page.reload();
    await expect(titleInput).toHaveValue("Updated Site Title");
  });

  test("validates metadata types", async ({ page }) => {
    await page.goto("/admin/settings/metadata");

    // Click Editing tab
    await page.click("text=Editing");

    // Try to enter non-integer in integer field
    const postsPerPageInput = page
      .locator('input[name="value"][type="number"]')
      .first();
    await postsPerPageInput.fill("not a number");
    await page.click('button:has-text("Save")');

    // Should see error
    await expect(page.locator("text=Invalid value")).toBeVisible();
  });
});
```

**Step 2: Write redirects E2E test**

```typescript
test.describe("Admin Settings - Redirects", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/login");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');
  });

  test("can create and delete redirect", async ({ page }) => {
    await page.goto("/admin/settings/redirects");

    // Create redirect
    await page.fill('input[name="from_path"]', "/old-page");
    await page.fill('input[name="to_path"]', "/new-page");
    await page.click('button:has-text("Create Redirect")');

    // Should see success toast
    await expect(page.locator("text=Redirect created")).toBeVisible();

    // Should see in table
    await expect(page.locator("text=/old-page")).toBeVisible();
    await expect(page.locator("text=/new-page")).toBeVisible();

    // Delete redirect
    await page.click('button:has-text("Delete")');

    // Should be removed
    await expect(page.locator("text=/old-page")).not.toBeVisible();
  });

  test("validates redirect paths", async ({ page }) => {
    await page.goto("/admin/settings/redirects");

    // Try invalid from path (doesn't start with /)
    await page.fill('input[name="from_path"]', "invalid-path");
    await page.fill('input[name="to_path"]', "/new-page");
    await page.click('button:has-text("Create Redirect")');

    // Should see error
    await expect(page.locator("text=Must start with /")).toBeVisible();
  });
});
```

**Step 3: Run E2E tests**

Run: `cd app && pnpm test:e2e admin-settings.spec.ts`
Expected: All tests pass

**Step 4: Commit E2E tests**

Run:

```bash
git add app/tests/e2e/admin-settings.spec.ts
git commit -m "test: add settings admin E2E tests (bean-<id>)"
```

---

### Task 12: Accessibility Testing

**Step 1: Test keyboard navigation**

Manual test checklist:

- [ ] Tab through all form fields in sequence
- [ ] Tab switches between tabs
- [ ] Enter/Space activates buttons and switches
- [ ] Escape closes dialogs/modals (if added)
- [ ] Focus visible on all interactive elements

**Step 2: Test screen reader support**

Manual test with screen reader:

- [ ] All form fields have accessible labels
- [ ] Error messages announced
- [ ] Toast notifications announced (aria-live)
- [ ] Tab roles announced correctly

**Step 3: Run automated accessibility checks**

Install axe if not already:

```bash
cd app && pnpm add -D @axe-core/playwright
```

Create accessibility test:

```typescript
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Settings accessibility", () => {
  test("metadata page has no accessibility violations", async ({ page }) => {
    await page.goto("/admin/settings/metadata");

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("redirects page has no accessibility violations", async ({ page }) => {
    await page.goto("/admin/settings/redirects");

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

Run: `cd app && pnpm test:e2e`
Expected: No accessibility violations

**Step 4: Document accessibility testing**

Create: `docs/testing/accessibility-settings.md`
Document: Manual testing checklist and results

---

## Documentation Phase

### Task 13: Write User Documentation

**Files:**

- Create: `docs/user-guide/admin-settings.md`

**Step 1: Write admin settings guide**

```markdown
# Admin Settings Guide

## Site Metadata

Site metadata controls global settings for your website including SEO, social media, and customization.

### Accessing Metadata Settings

1. Log in as an admin
2. Navigate to **Admin > Settings > Metadata**

### Metadata Categories

**General**

- **Site Title:** Main title for your website (appears in browser tab and search results)
- **Site Description:** Brief description for SEO and social media
- **Site Logo:** URL to your logo image
- **Default Social Image:** Fallback image for social media shares

**Social Media**

- **BlueSky Handle:** Your BlueSky username (e.g., @user.bsky.social)

**IndieWeb**

- **Fediverse Handle:** Your Fediverse handle (e.g., @user@mastodon.social)
- **Fediverse Username:** Your Fediverse username

**Editing**

- **Admin Posts Per Page:** Number of posts to show in admin lists
- **Posts Per Page:** Number of posts to show on frontend
- **Revisions to Keep:** Number of content revisions (-1 = unlimited)

**Customization**

- **CDN URL:** Content Delivery Network URL for assets
- **Custom CSS:** Additional CSS styles (advanced users)
- **JavaScript Tags:** Analytics or tracking code (advanced users)

**Other**

- **Enable Comments:** Toggle comments on/off site-wide

### Saving Changes

Changes save immediately when you click "Save" on any field. You'll see a success notification.

### Validation

The system validates your input based on the field type:

- **Integer fields:** Must be whole numbers
- **Float fields:** Can include decimals
- **Boolean fields:** Toggle switch for true/false
- **JSON fields:** Must be valid JSON syntax
- **Code fields:** Syntax highlighting for CSS/JavaScript

---

## URL Redirects

Redirects allow you to send visitors from old URLs to new ones.

### Creating a Redirect

1. Navigate to **Admin > Settings > Redirects**
2. Fill in **From Path** (the old URL)
3. Fill in **To Path** (the new URL)
4. Click **Create Redirect**

**Example:**

- From: `/old-blog-post`
- To: `/new-blog-post`

### Path Requirements

- **From Path:** Must start with `/` (e.g., `/old-path`)
- **To Path:** Can be:
  - A path starting with `/` (e.g., `/new-path`)
  - A full URL (e.g., `https://external-site.com`)

### Deleting Redirects

Click the **Delete** button next to any redirect to remove it.

### Status Codes

All redirects use HTTP 301 (permanent redirect) by default.
```

**Step 2: Commit user documentation**

Run:

```bash
git add docs/user-guide/admin-settings.md
git commit -m "docs: add settings admin user guide (bean-<id>)"
```

---

### Task 14: Write Developer Documentation

**Files:**

- Create: `docs/development/settings-architecture.md`

**Step 1: Write architecture docs**

````markdown
# Settings Architecture

## Metadata System

### Database Schema

Collection: `metadata`

| Field       | Type     | Required | Description                                                                |
| ----------- | -------- | -------- | -------------------------------------------------------------------------- |
| id          | text     | Yes      | 15-character PK                                                            |
| key         | text     | Yes      | Unique identifier (UNIQUE INDEX)                                           |
| nice_name   | text     | No       | Display name                                                               |
| value       | text     | No       | String value (typed by `type` field)                                       |
| type        | select   | Yes      | `string`, `integer`, `float`, `json`, `boolean`, `code`                    |
| description | text     | No       | Help text                                                                  |
| group       | select   | No       | `general`, `editing`, `social_media`, `indieweb`, `customization`, `other` |
| updated     | autodate | No       | Auto-updated timestamp                                                     |

### Type System

The `type` field determines how values are validated and displayed:

- **string:** Free text input
- **integer:** Whole number input
- **float:** Decimal number input
- **json:** JSON object (validated on save)
- **boolean:** Toggle switch (stored as "true"/"false" string)
- **code:** Syntax-highlighted textarea

### Default Metadata

14 default entries created during migration (`1771043492_populate_default_metadata.js`):

| Key                  | Type    | Group         | Usage               |
| -------------------- | ------- | ------------- | ------------------- |
| site_title           | string  | general       | SEO, meta tags      |
| site_description     | string  | general       | SEO, meta tags      |
| site_logo            | string  | general       | Branding            |
| og_image             | string  | general       | Social media        |
| fediverse_handle     | string  | indieweb      | Meta tags           |
| fediverse_username   | string  | indieweb      | Meta tags           |
| bluesky_handle       | string  | social_media  | Meta tags           |
| cdn_url              | string  | customization | Asset loading       |
| admin_posts_per_page | integer | editing       | Admin pagination    |
| posts_per_page       | integer | editing       | Frontend pagination |
| revisions_kept       | integer | editing       | Content versioning  |
| comments_enabled     | boolean | other         | Feature flag        |
| custom_css           | code    | customization | Style injection     |
| js_tags              | code    | customization | Analytics/tracking  |

### PocketBase Hooks

Hook: `db/pb_hooks/12-metadata-defaults.pb.js`

- Validates metadata on create/update
- Patches missing fields with defaults
- Ensures type/value consistency

### Frontend Usage

**Loading Metadata:**

```typescript
// In +layout.server.ts
const metadata = await pb.collection("metadata").getFullList({
  fields: "key,value,type",
});

const metadataObj = metadataListToObject(metadata);
```
````

**Helper Function:**

```typescript
// In $lib/server/nav.ts
export function metadataListToObject(
  metadata: MetadataResponse[]
): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const item of metadata) {
    obj[item.key] = item.value || "";
  }
  return obj;
}
```

**Caching:**

Metadata loaded on every layout render. Consider adding:

- Server-side caching (60s TTL)
- Revalidation on update

---

## Redirects System

### Database Schema

Collection: `redirects`

| Field       | Type    | Required | Description             |
| ----------- | ------- | -------- | ----------------------- |
| id          | text    | Yes      | 15-character PK         |
| from_path   | text    | Yes      | Source path             |
| to_path     | text    | Yes      | Destination path or URL |
| status_code | number  | Yes      | HTTP status (301-308)   |
| permanent   | boolean | Yes      | Permanent redirect flag |

### Validation Rules

- **from_path:** Must start with `/`
- **to_path:** Must be full URL or path starting with `/`
- **status_code:** Integer 301-308

### Implementation Notes

**Current State:** Redirects are managed in admin UI but not yet enforced in the app.

**TODO:** Implement redirect middleware in `hooks.server.ts`:

```typescript
export const handle: Handle = async ({ event, resolve }) => {
  // Check for redirect
  const redirect = await pb
    .collection("redirects")
    .getFirstListItem(`from_path = "${event.url.pathname}"`);

  if (redirect) {
    throw redirect(redirect.status_code, redirect.to_path);
  }

  return resolve(event);
};
```

**Performance:** Cache redirects in memory with periodic refresh.

````

**Step 2: Commit developer docs**

Run:
```bash
git add docs/development/settings-architecture.md
git commit -m "docs: add settings architecture documentation (bean-<id>)"
````

---

## Completion Checklist

- [ ] Metadata schema reviewed
- [ ] shadcn-svelte components verified
- [ ] Validation schemas created and tested
- [ ] Server load functions implemented
- [ ] Server actions implemented
- [ ] Metadata form component created
- [ ] Metadata page with tabs created
- [ ] Redirects CRUD implemented
- [ ] E2E tests written and passing
- [ ] Accessibility tests passing
- [ ] User documentation written
- [ ] Developer documentation written
- [ ] All commits include bean ID
- [ ] Quality gates passed (lint, test, build)

---

## Follow-Up Tasks

**Future Enhancements:**

- Redirect middleware enforcement (`hooks.server.ts`)
- Metadata caching strategy
- Bulk metadata import/export
- Metadata versioning/history
- Redirect analytics (click tracking)

**Dependencies for Other Features:**

- User management will add role-based metadata visibility
- Subscriptions may add tier-specific metadata
- CLI will add metadata seeding commands
