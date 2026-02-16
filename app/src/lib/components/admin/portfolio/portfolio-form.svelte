<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import * as Form from '$lib/components/ui/form';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Switch } from '$lib/components/ui/switch';
  import { Textarea } from '$lib/components/ui/textarea';
  import { portfolioSchema, type PortfolioSchema } from '$lib/schemas/portfolio';
  import { toast } from '$lib/stores/toast';
  import type { MediaResponse } from '$lib/types/pocketbase';
  import { getFileUrl } from '$lib/utils';
  import { generateSlug as createSlug } from '$lib/utils/slug-utils';
  import { type Infer, superForm, type SuperValidated } from 'sveltekit-superforms';
  import { zod4Client } from 'sveltekit-superforms/adapters';

  type FormDataShape = {
    form: SuperValidated<Infer<PortfolioSchema>>;
    item?: {
      id: string;
      slug?: string;
      title?: string;
    };
    existingMediaRecords?: MediaResponse[];
    cdnUrl?: string;
  };

  let {
    data,
    isEdit = false,
    itemId,
  }: {
    data: FormDataShape;
    isEdit?: boolean;
    itemId?: string;
  } = $props();

  // svelte-ignore state_referenced_locally
  const initialFormState = data.form;

  // svelte-ignore state_referenced_locally
  const form = superForm(initialFormState, {
    id: isEdit && itemId ? `admin-portfolio-edit-${itemId}` : 'admin-portfolio-create',
    validators: zod4Client(portfolioSchema),
    resetForm: false,
    onResult: ({ result }) => {
      if (result.type === 'redirect') {
        toast(isEdit ? 'Portfolio item updated successfully' : 'Portfolio item created successfully', 'success');
      } else if (result.type === 'failure') {
        toast('Failed to save portfolio item', 'error');
      }
    },
  });

  const { form: formData, enhance } = form;

  function generateSlug() {
    if ($formData.title && !$formData.slug) {
      $formData.slug = createSlug($formData.title);
    }
  }

  function removeExistingMedia(mediaId: string) {
    $formData.existingMedia = ($formData.existingMedia || []).filter(id => id !== mediaId);
  }
</script>

<form
  method="POST"
  action={isEdit ? '?/update' : undefined}
  use:enhance
  enctype="multipart/form-data"
  class="surface-enter space-y-6"
>
  <div class="grid gap-6 md:grid-cols-2">
    <Form.Field {form} name="title" class="md:col-span-2">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Title</Form.Label>
          <Input
            {...props}
            bind:value={$formData.title}
            type="text"
            onblur={generateSlug}
            placeholder="Portfolio item title"
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="slug" class="md:col-span-2">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Slug</Form.Label>
          <Input {...props} bind:value={$formData.slug} type="text" placeholder="portfolio-item-slug" />
        {/snippet}
      </Form.Control>
      <Form.Description>URL-friendly identifier (lowercase, numbers, hyphens)</Form.Description>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="summary" class="md:col-span-2">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Summary</Form.Label>
          <Textarea {...props} bind:value={$formData.summary} placeholder="Brief summary" rows={3} />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="description" class="md:col-span-2">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Description</Form.Label>
          <Textarea {...props} bind:value={$formData.description} placeholder="Project description" rows={8} />
        {/snippet}
      </Form.Control>
      <Form.Description>
        This is separate from media attachments and appears in the description section on the public page.
      </Form.Description>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="url" class="md:col-span-2">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Project URL</Form.Label>
          <Input {...props} bind:value={$formData.url} type="url" placeholder="https://example.com" />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="image">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Cover Image</Form.Label>
          <Input {...props} type="file" accept="image/*" />
        {/snippet}
      </Form.Control>
      <Form.Description>Main cover image shown at top of detail page.</Form.Description>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="media">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Gallery Media</Form.Label>
          <Input {...props} type="file" accept="image/*,video/*,audio/*" multiple />
        {/snippet}
      </Form.Control>
      <Form.Description>Uploaded files are presented in a separate media section.</Form.Description>
      <Form.FieldErrors />
    </Form.Field>
  </div>

  {#if data.existingMediaRecords && data.existingMediaRecords.length > 0}
    <div class="surface-enter space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm">
      <h2 class="font-semibold">Existing Gallery Media</h2>
      <ul class="grid grid-cols-1 gap-3 md:grid-cols-2">
        {#each data.existingMediaRecords as media (media.id)}
          {#if ($formData.existingMedia || []).includes(media.id)}
            <li class="rounded-md border p-3">
              {#if media.file}
                <img
                  src={getFileUrl('media', media.id, media.file, data.cdnUrl)}
                  alt={media.alt_text || media.caption || 'Portfolio media'}
                  class="mb-2 h-36 w-full rounded object-cover"
                />
              {/if}
              <div class="flex items-center justify-between gap-2">
                <p class="line-clamp-1 text-xs text-muted-foreground">
                  {media.caption || media.alt_text || media.file}
                </p>
                <Button type="button" variant="outline" size="sm" onclick={() => removeExistingMedia(media.id)}
                  >Remove</Button
                >
              </div>
            </li>
          {/if}
        {/each}
      </ul>
    </div>
  {/if}

  {#if $formData.existingMedia?.length}
    {#each $formData.existingMedia as mediaId (mediaId)}
      <input type="hidden" name="existingMedia" value={mediaId} />
    {/each}
  {/if}

  <div class="surface-enter space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm">
    <h2 class="font-semibold">Visibility</h2>

    <Form.Field {form} name="published">
      <Form.Control>
        {#snippet children({ props })}
          <div class="flex items-center gap-3">
            <Switch {...props} id="published" bind:checked={$formData.published} />
            <Label for="published">Published</Label>
          </div>
        {/snippet}
      </Form.Control>
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
      <Form.FieldErrors />
    </Form.Field>
  </div>

  <div class="flex gap-4">
    <Form.Button type="submit">{isEdit ? 'Update Portfolio Item' : 'Create Portfolio Item'}</Form.Button>
    {#if isEdit && data.item?.slug}
      <Button
        type="button"
        variant="secondary"
        href={`/portfolio/${data.item.slug}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Open Public Page
      </Button>
    {/if}
    <Button type="button" variant="outline" href="/admin/portfolio">Cancel</Button>
  </div>
</form>
