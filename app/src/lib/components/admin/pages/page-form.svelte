<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import * as Form from '$lib/components/ui/form';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Switch } from '$lib/components/ui/switch';
  import { Textarea } from '$lib/components/ui/textarea';
  import TipexEditor from '$lib/components/ui/tipex-editor.svelte';
  import { pageSchema, type PageSchema } from '$lib/schemas/page';
  import { toast } from '$lib/stores/toast';
  import type { PagesResponse } from '$lib/types/pocketbase';
  import { generateSlug as createSlug } from '$lib/utils/slug-utils';
  import { type Infer, superForm, type SuperValidated } from 'sveltekit-superforms';
  import { zod4Client } from 'sveltekit-superforms/adapters';

  let {
    data,
    isEdit = false,
    parentSlug = null,
    pageId,
    availableParents = [],
  }: {
    data: { form: SuperValidated<Infer<PageSchema>> };
    isEdit?: boolean;
    parentSlug?: string | null;
    pageId?: string;
    availableParents?: PagesResponse[];
  } = $props();

  // svelte-ignore state_referenced_locally
  const form = superForm(data.form, {
    validators: zod4Client(pageSchema),
    resetForm: false,
    onResult: ({ result }) => {
      if (result.type === 'redirect') {
        toast(isEdit ? 'Page updated successfully' : 'Page created successfully', 'success');
      } else if (result.type === 'failure') {
        toast('Failed to save page', 'error');
      }
    },
  });

  const { form: formData, enhance } = form;

  // Generate slug from title using stopword removal and snake case
  function generateSlug() {
    if ($formData.title && !$formData.slug) {
      $formData.slug = createSlug($formData.title);
    }
  }
</script>

<form method="POST" use:enhance enctype="multipart/form-data" class="space-y-6">
  <div class="grid gap-6 md:grid-cols-2">
    <!-- Title -->
    <Form.Field {form} name="title" class="md:col-span-2">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Title</Form.Label>
          <Input {...props} bind:value={$formData.title} type="text" onblur={generateSlug} placeholder="Page title" />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <!-- Slug -->
    <Form.Field {form} name="slug" class="md:col-span-2">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Slug</Form.Label>
          {#if parentSlug}
            <div class="relative">
              <span class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                {parentSlug}/
              </span>
              <Input
                {...props}
                bind:value={$formData.slug}
                type="text"
                placeholder="page-slug"
                class="pl-[calc(1ch*{parentSlug.length}+2rem)]"
              />
            </div>
          {:else}
            <Input {...props} bind:value={$formData.slug} type="text" placeholder="page-slug" />
          {/if}
        {/snippet}
      </Form.Control>
      <Form.Description>URL-friendly identifier (lowercase, numbers, hyphens)</Form.Description>
      <Form.FieldErrors />
    </Form.Field>

    <!-- Parent Page -->
    <Form.Field {form} name="parent" class="md:col-span-2">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Parent Page</Form.Label>
          <select
            {...props}
            bind:value={$formData.parent}
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">None (Top Level)</option>
            {#each availableParents as page}
              <option value={page.id}>{page.title}</option>
            {/each}
          </select>
        {/snippet}
      </Form.Control>
      <Form.Description>Select a parent page to create a hierarchy</Form.Description>
      <Form.FieldErrors />
    </Form.Field>

    <!-- Summary -->
    <Form.Field {form} name="summary" class="md:col-span-2">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Summary</Form.Label>
          <Textarea {...props} bind:value={$formData.summary} placeholder="Brief page description" rows={3} />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <!-- Content -->
    <Form.Field {form} name="content" class="md:col-span-2">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Content</Form.Label>
          <TipexEditor bind:value={$formData.content} placeholder="Write your page content here..." />
        {/snippet}
      </Form.Control>
      <Form.Description>Full page content (rich text editor)</Form.Description>
      <Form.FieldErrors />
    </Form.Field>

    <!-- Collection -->
    <Form.Field {form} name="collection">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Collection</Form.Label>
          <select
            {...props}
            bind:value={$formData.collection}
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">None</option>
            <option value="posts">Posts</option>
            <option value="tags">Tags</option>
          </select>
        {/snippet}
      </Form.Control>
      <Form.Description>Assign this page to a collection</Form.Description>
      <Form.FieldErrors />
    </Form.Field>

    <!-- Order -->
    <Form.Field {form} name="order">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Order</Form.Label>
          <Input {...props} bind:value={$formData.order} type="number" min="0" placeholder="0" />
        {/snippet}
      </Form.Control>
      <Form.Description>Display order (lower numbers appear first)</Form.Description>
      <Form.FieldErrors />
    </Form.Field>

    <!-- Image Upload -->
    <Form.Field {form} name="image">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Featured Image</Form.Label>
          <Input {...props} type="file" accept="image/*" />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <!-- Media Upload (Multiple) -->
    <Form.Field {form} name="media" class="md:col-span-2">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Media Files</Form.Label>
          <Input {...props} type="file" accept="image/*,video/*,audio/*" multiple />
        {/snippet}
      </Form.Control>
      <Form.Description>Upload multiple media files</Form.Description>
      <Form.FieldErrors />
    </Form.Field>
  </div>

  <!-- Switches Section -->
  <div class="space-y-4 rounded-lg border p-4">
    <h3 class="font-semibold">Page Settings</h3>

    <Form.Field {form} name="published">
      <Form.Control>
        {#snippet children({ props })}
          <div class="flex items-center gap-3">
            <Switch {...props} id="published" bind:checked={$formData.published} />
            <Label for="published">Published</Label>
          </div>
        {/snippet}
      </Form.Control>
      <Form.Description>Make this page visible to the public</Form.Description>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="visible">
      <Form.Control>
        {#snippet children({ props })}
          <div class="flex items-center gap-3">
            <Switch {...props} id="visible" bind:checked={$formData.visible} />
            <Label for="visible">Visible</Label>
          </div>
        {/snippet}
      </Form.Control>
      <Form.Description>Show this page in navigation/listings</Form.Description>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="require_login">
      <Form.Control>
        {#snippet children({ props })}
          <div class="flex items-center gap-3">
            <Switch {...props} id="require_login" bind:checked={$formData.require_login} />
            <Label for="require_login">Require Login</Label>
          </div>
        {/snippet}
      </Form.Control>
      <Form.Description>Users must be logged in to view this page</Form.Description>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="subscriber_only">
      <Form.Control>
        {#snippet children({ props })}
          <div class="flex items-center gap-3">
            <Switch {...props} id="subscriber_only" bind:checked={$formData.subscriber_only} />
            <Label for="subscriber_only">Subscriber Only</Label>
          </div>
        {/snippet}
      </Form.Control>
      <Form.Description>Only subscribers can view this page</Form.Description>
      <Form.FieldErrors />
    </Form.Field>
  </div>

  <!-- Custom CSS -->
  <Form.Field {form} name="custom_css" class="md:col-span-2">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Custom CSS</Form.Label>
        <Textarea
          {...props}
          bind:value={$formData.custom_css}
          placeholder=".my-class {'{'} color: red; {'}'}"
          rows={5}
          class="font-mono text-sm"
        />
      {/snippet}
    </Form.Control>
    <Form.Description>Custom CSS styles for this page only</Form.Description>
    <Form.FieldErrors />
  </Form.Field>

  <!-- Actions -->
  <div class="flex gap-4">
    <Form.Button type="submit">{isEdit ? 'Update Page' : 'Create Page'}</Form.Button>
    {#if isEdit && pageId}
      <Button
        type="button"
        variant="secondary"
        href={`/preview/pages/${pageId}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Open Preview
      </Button>
    {/if}
    <Button type="button" variant="outline" href="/admin/pages">Cancel</Button>
  </div>
</form>
