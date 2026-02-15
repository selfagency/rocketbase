<script lang="ts">
  import RevisionHistoryDialog from '$lib/components/admin/revisions/revision-history-dialog.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Form from '$lib/components/ui/form';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { MultiSelect, type MultiSelectOption } from '$lib/components/ui/multi-select';
  import { Switch } from '$lib/components/ui/switch';
  import { Textarea } from '$lib/components/ui/textarea';
  import TipexEditor from '$lib/components/ui/tipex-editor.svelte';
  import { postSchema, type PostSchema } from '$lib/schemas/post';
  import { toast } from '$lib/stores/toast';
  import type { RevisionHistoryEntry } from '$lib/types/revision-history';
  import { generateSlug as createSlug } from '$lib/utils/slug-utils';
  import { createEventDispatcher } from 'svelte';
  import { type Infer, superForm, type SuperValidated } from 'sveltekit-superforms';
  import { zod4Client } from 'sveltekit-superforms/adapters';

  type FormDataShape = {
    form: SuperValidated<Infer<PostSchema>>;
    authors: { id: string; name: string }[];
    tags: { id: string; name: string }[];
    pexelsEnabled?: boolean;
    revisions?: RevisionHistoryEntry[];
    post?: {
      id: string;
      slug: string;
      title?: string;
    };
  };

  const postDiffFields = [
    { key: 'title', label: 'Title' },
    { key: 'slug', label: 'Slug' },
    { key: 'summary', label: 'Summary' },
    { key: 'content', label: 'Content' },
    { key: 'embed', label: 'Embed code' },
    { key: 'enclosure', label: 'Enclosure URL' },
  ];

  let {
    data,
    isEdit = false,
    postId,
  }: {
    data: FormDataShape;
    isEdit?: boolean;
    postId?: string;
  } = $props();

  const dispatch = createEventDispatcher<{
    draftIdentityChanged: { formId: string; slug: string };
  }>();

  const initialFormState = (() => {
    if (!isEdit && !data.form.posted) {
      return { ...data.form, errors: {} };
    }

    return data.form;
  })();

  // svelte-ignore state_referenced_locally
  const form = superForm(initialFormState, {
    id:
      isEdit && postId
        ? `admin-post-edit-${postId}`
        : typeof data.form.id === 'string' && data.form.id.trim()
          ? data.form.id
          : 'admin-post-create',
    validators: zod4Client(postSchema),
    resetForm: false,
    onResult: ({ result }) => {
      if (result.type === 'redirect') {
        toast(isEdit ? 'Post updated successfully' : 'Post created successfully', 'success');
      } else if (result.type === 'failure') {
        toast('Failed to save post', 'error');
      }
    },
  });

  const { form: formData, enhance } = form;

  type SnapshotPayload = {
    formData: Infer<PostSchema>;
  };

  function sanitizeSnapshotValue<T>(input: T): T {
    const seen = new WeakSet<object>();

    return JSON.parse(
      JSON.stringify(input, (_key, value) => {
        if (value instanceof Date) {
          return value.toISOString();
        }

        if (typeof File !== 'undefined' && value instanceof File) {
          return undefined;
        }

        if (typeof Blob !== 'undefined' && value instanceof Blob) {
          return undefined;
        }

        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) return undefined;
          seen.add(value);
        }

        return value;
      })
    ) as T;
  }

  export function captureFormSnapshot() {
    const safeFormData = sanitizeSnapshotValue($formData) as Infer<PostSchema>;

    return {
      formData: {
        ...safeFormData,
        content: safeFormData.content ?? '',
      },
    } satisfies SnapshotPayload;
  }

  export function restoreFormSnapshot(snapshot: unknown) {
    if (!snapshot || typeof snapshot !== 'object') return;

    const payload = snapshot as Partial<SnapshotPayload>;
    if (!payload.formData || typeof payload.formData !== 'object') return;

    const restored = sanitizeSnapshotValue(payload.formData) as Infer<PostSchema>;
    Object.assign($formData, restored, {
      content: restored.content ?? '',
      attachments: Array.isArray(restored.attachments) ? restored.attachments : [],
    });
  }

  const authorOptions = $derived<MultiSelectOption[]>(
    data.authors.map(author => ({
      value: author.id,
      label: author.name,
    }))
  );

  const tagOptions = $derived<MultiSelectOption[]>(
    data.tags.map(tag => ({
      value: tag.id,
      label: tag.name,
    }))
  );

  function generateSlug() {
    if ($formData.title && !$formData.slug) {
      $formData.slug = createSlug($formData.title);
    }
  }

  function getDraftSlug(): string {
    const explicitSlug = ($formData.slug ?? '').trim();
    if (explicitSlug) {
      return createSlug(explicitSlug) || 'untitled-post';
    }

    const titleSlug = createSlug(($formData.title ?? '').trim());
    return titleSlug || 'untitled-post';
  }

  function getDraftFormId(): string {
    if (isEdit && postId) {
      return `admin-post-edit-${postId}`;
    }

    if (typeof data.form.id === 'string' && data.form.id.trim()) {
      return data.form.id;
    }

    return 'admin-post-create';
  }

  $effect(() => {
    if (isEdit) return;

    dispatch('draftIdentityChanged', {
      formId: getDraftFormId(),
      slug: getDraftSlug(),
    });
  });
</script>

<form
  method="POST"
  action={isEdit ? '?/update' : undefined}
  use:enhance
  enctype="multipart/form-data"
  class="space-y-6"
>
  <div class="grid gap-6 md:grid-cols-2">
    <Form.Field {form} name="title" class="md:col-span-2">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Title</Form.Label>
          <Input {...props} bind:value={$formData.title} type="text" onblur={generateSlug} placeholder="Post title" />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="slug" class="md:col-span-2">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Slug</Form.Label>
          <Input {...props} bind:value={$formData.slug} type="text" placeholder="post-slug" />
        {/snippet}
      </Form.Control>
      <Form.Description>URL-friendly identifier (lowercase, numbers, hyphens)</Form.Description>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="summary" class="md:col-span-2">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Summary</Form.Label>
          <Textarea {...props} bind:value={$formData.summary} placeholder="Brief post summary" rows={3} />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="content" class="md:col-span-2">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Content</Form.Label>
          <TipexEditor
            bind:value={$formData.content}
            bind:attachments={$formData.attachments}
            entityType="post"
            entityId={data.post?.id}
            pexelsEnabled={Boolean(data.pexelsEnabled)}
            placeholder="Write your post content here..."
          />
        {/snippet}
      </Form.Control>
      <Form.Description>Full post content (rich text editor)</Form.Description>
      <Form.FieldErrors />
    </Form.Field>

    {#if $formData.attachments?.length}
      {#each $formData.attachments as attachmentId (attachmentId)}
        <input type="hidden" name="attachments" value={attachmentId} />
      {/each}
    {/if}

    <Form.Field {form} name="date">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Publish Date</Form.Label>
          <Input {...props} bind:value={$formData.date} type="datetime-local" />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="enclosure">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Enclosure URL</Form.Label>
          <Input {...props} bind:value={$formData.enclosure} type="url" placeholder="https://example.com/audio.mp3" />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="embed" class="md:col-span-2">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Embed Code</Form.Label>
          <Textarea {...props} bind:value={$formData.embed} placeholder="Embed HTML (optional)" rows={4} />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="author" class="md:col-span-2">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Authors</Form.Label>
          <MultiSelect
            {...props}
            bind:value={$formData.author}
            options={authorOptions}
            placeholder="Select authors"
            searchPlaceholder="Search authors..."
            aria-describedby="author-help"
          />
        {/snippet}
      </Form.Control>
      <Form.Description id="author-help">Select one or more authors.</Form.Description>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="tags" class="md:col-span-2">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Tags</Form.Label>
          <MultiSelect
            {...props}
            bind:value={$formData.tags}
            options={tagOptions}
            placeholder="Select tags"
            searchPlaceholder="Search tags..."
            aria-describedby="tags-help"
          />
        {/snippet}
      </Form.Control>
      <Form.Description id="tags-help">Select any tags you want to assign.</Form.Description>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="image">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Featured Image</Form.Label>
          <Input {...props} type="file" accept="image/*" />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="media">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Media Attachments</Form.Label>
          <Input {...props} type="file" accept="image/*,video/*,audio/*" multiple />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
  </div>

  <div class="space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm">
    <h2 class="font-semibold">Post Settings</h2>

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

    <Form.Field {form} name="require_login">
      <Form.Control>
        {#snippet children({ props })}
          <div class="flex items-center gap-3">
            <Switch {...props} id="require_login" bind:checked={$formData.require_login} />
            <Label for="require_login">Require Login</Label>
          </div>
        {/snippet}
      </Form.Control>
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
      <Form.FieldErrors />
    </Form.Field>
  </div>

  <div class="flex gap-4">
    <Form.Button type="submit">{isEdit ? 'Update Post' : 'Create Post'}</Form.Button>
    {#if isEdit && postId && data.post?.slug}
      <Button
        type="button"
        variant="secondary"
        href={`/preview/posts/${data.post.slug}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Open Preview
      </Button>
    {/if}
    <Button type="button" variant="outline" href="/admin/posts">Cancel</Button>
  </div>

  {#if isEdit}
    <RevisionHistoryDialog
      revisions={data.revisions ?? []}
      restoreAction="?/restoreRevision"
      diffFields={postDiffFields}
    />
  {/if}
</form>
