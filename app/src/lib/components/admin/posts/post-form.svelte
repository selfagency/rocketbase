<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import * as Form from '$lib/components/ui/form';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Switch } from '$lib/components/ui/switch';
  import { Textarea } from '$lib/components/ui/textarea';
  import { postSchema, type PostSchema } from '$lib/schemas/post';
  import { toast } from '$lib/stores/toast';
  import { generateSlug as createSlug } from '$lib/utils/slug-utils';
  import { type Infer, superForm, type SuperValidated } from 'sveltekit-superforms';
  import { zod4Client } from 'sveltekit-superforms/adapters';

  type FormDataShape = {
    form: SuperValidated<Infer<PostSchema>>;
    authors: { id: string; name: string }[];
    tags: { id: string; name: string }[];
    post?: {
      id: string;
      slug: string;
      title?: string;
    };
  };

  let {
    data,
    isEdit = false,
    postId,
  }: {
    data: FormDataShape;
    isEdit?: boolean;
    postId?: string;
  } = $props();

  // svelte-ignore state_referenced_locally
  const form = superForm(data.form, {
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

  function generateSlug() {
    if ($formData.title && !$formData.slug) {
      $formData.slug = createSlug($formData.title);
    }
  }
</script>

<form method="POST" use:enhance enctype="multipart/form-data" class="space-y-6">
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
          <Textarea {...props} bind:value={$formData.content} placeholder="Post content (HTML supported)" rows={12} />
        {/snippet}
      </Form.Control>
      <Form.Description>Full post content (supports HTML)</Form.Description>
      <Form.FieldErrors />
    </Form.Field>

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
          <select
            {...props}
            bind:value={$formData.author}
            multiple
            class="flex min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
            aria-describedby="author-help"
          >
            {#each data.authors as author (author.id)}
              <option value={author.id}>{author.name}</option>
            {/each}
          </select>
        {/snippet}
      </Form.Control>
      <Form.Description id="author-help">Select one or more authors (Cmd/Ctrl+click for multiple).</Form.Description>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="tags" class="md:col-span-2">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Tags</Form.Label>
          <select
            {...props}
            bind:value={$formData.tags}
            multiple
            class="flex min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
            aria-describedby="tags-help"
          >
            {#each data.tags as tag (tag.id)}
              <option value={tag.id}>{tag.name}</option>
            {/each}
          </select>
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

  <div class="space-y-4 rounded-lg border p-4">
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
</form>
