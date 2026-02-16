<script lang="ts">
  import { page } from '$app/state';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Textarea } from '$lib/components/ui/textarea';
  import { toast } from '$lib/stores/toast';
  import { onMount } from 'svelte';
  import { MetaTags } from 'svelte-meta-tags';
  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  onMount(() => {
    const outcome = page.url.searchParams.get('faq');

    if (outcome === 'created') toast('FAQ created successfully.', 'success');
    if (outcome === 'updated') toast('FAQ updated successfully.', 'success');
    if (outcome === 'deleted') toast('FAQ deleted.', 'success');
    if (outcome === 'published') toast('FAQ published.', 'success');
    if (outcome === 'unpublished') toast('FAQ unpublished.', 'success');
    if (outcome === 'reordered') toast('FAQ order updated.', 'success');
    if (outcome === 'reorder_noop') toast('FAQ is already at that position.', 'info');
  });

  const createErrors = $derived<Record<string, string[]>>(
    form?.action === 'create' ? ((form.fieldErrors as Record<string, string[]>) ?? {}) : {}
  );

  const metaTags = $derived({
    title: 'Admin FAQs',
    description: 'Manage frequently asked questions in the admin dashboard',
    robots: 'noindex, nofollow',
  });
</script>

<MetaTags {...metaTags} />

<div class="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
  <div class="mb-8 flex flex-wrap items-start justify-between gap-4">
    <div>
      <h1 class="text-3xl font-bold">FAQs</h1>
      <p class="mt-2 text-muted-foreground">Create, update, publish, and reorder frequently asked questions.</p>
    </div>
    <Badge variant="secondary">{data.faqs.length} total</Badge>
  </div>

  {#if form?.message}
    <div class="mb-6 rounded-md border border-destructive/40 bg-destructive/5 p-3" role="alert" aria-live="polite">
      <p class="text-sm text-destructive">{form.message}</p>
    </div>
  {/if}

  <section class="mb-8 rounded-lg border border-border/70 bg-card p-4 md:p-6" aria-labelledby="create-faq-heading">
    <h2 id="create-faq-heading" class="mb-4 text-xl font-semibold">Create FAQ</h2>
    <form method="POST" action="?/create" class="grid gap-4 md:grid-cols-2">
      <div class="md:col-span-2">
        <Label for="create-question">Question</Label>
        <Input id="create-question" name="question" required aria-invalid={createErrors.question ? 'true' : 'false'} />
        {#if createErrors.question}
          <p class="mt-1 text-xs text-destructive">{createErrors.question[0]}</p>
        {/if}
      </div>

      <div class="md:col-span-2">
        <Label for="create-answer">Answer</Label>
        <Textarea
          id="create-answer"
          name="answer"
          required
          rows={5}
          aria-invalid={createErrors.answer ? 'true' : 'false'}
        />
        {#if createErrors.answer}
          <p class="mt-1 text-xs text-destructive">{createErrors.answer[0]}</p>
        {/if}
      </div>

      <div>
        <Label for="create-category">Category</Label>
        <Input id="create-category" name="category" />
      </div>

      <div>
        <Label for="create-slug">Slug</Label>
        <Input id="create-slug" name="slug" placeholder="billing-faq" />
      </div>

      <div>
        <Label for="create-locale">Locale</Label>
        <Input id="create-locale" name="locale" value="en" />
      </div>

      <div>
        <Label for="create-sort-order">Sort order</Label>
        <Input id="create-sort-order" name="sort_order" type="number" min="0" value="0" required />
      </div>

      <div class="flex items-center justify-between md:col-span-2">
        <label for="create-published" class="inline-flex items-center gap-2 text-sm">
          <input id="create-published" name="is_published" type="checkbox" class="h-4 w-4" />
          Publish immediately
        </label>

        <Button type="submit">Create FAQ</Button>
      </div>
    </form>
  </section>

  <section aria-labelledby="manage-faqs-heading">
    <h2 id="manage-faqs-heading" class="mb-4 text-xl font-semibold">Manage FAQs</h2>

    {#if data.faqs.length === 0}
      <div class="rounded-lg border border-border/70 p-6 text-center">
        <p class="text-muted-foreground">No FAQs yet. Create your first one above.</p>
      </div>
    {:else}
      <ul class="space-y-3">
        {#each data.faqs as faq, index (faq.id)}
          <li class="rounded-lg border border-border/70 bg-card p-4">
            <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div class="min-w-0">
                <h3 class="truncate font-semibold">{faq.question}</h3>
                <p class="text-xs text-muted-foreground">
                  #{faq.sort_order ?? 0}
                  •
                  {faq.locale || 'en'}
                  •
                  {faq.category || 'uncategorized'}
                </p>
              </div>

              <div class="flex items-center gap-2">
                <Badge variant={faq.is_published ? 'default' : 'secondary'}>
                  {faq.is_published ? 'Published' : 'Draft'}
                </Badge>

                <form method="POST" action="?/move">
                  <input type="hidden" name="id" value={faq.id} />
                  <input type="hidden" name="direction" value="up" />
                  <Button type="submit" variant="outline" size="sm" disabled={index === 0}>↑</Button>
                </form>

                <form method="POST" action="?/move">
                  <input type="hidden" name="id" value={faq.id} />
                  <input type="hidden" name="direction" value="down" />
                  <Button type="submit" variant="outline" size="sm" disabled={index === data.faqs.length - 1}>↓</Button>
                </form>
              </div>
            </div>

            <form method="POST" action="?/update" class="grid gap-3 md:grid-cols-2">
              <input type="hidden" name="id" value={faq.id} />

              <div class="md:col-span-2">
                <Label for={`question-${faq.id}`}>Question</Label>
                <Input id={`question-${faq.id}`} name="question" value={faq.question} required />
              </div>

              <div class="md:col-span-2">
                <Label for={`answer-${faq.id}`}>Answer</Label>
                <Textarea id={`answer-${faq.id}`} name="answer" rows={4} required value={faq.answer} />
              </div>

              <div>
                <Label for={`category-${faq.id}`}>Category</Label>
                <Input id={`category-${faq.id}`} name="category" value={faq.category || ''} />
              </div>

              <div>
                <Label for={`slug-${faq.id}`}>Slug</Label>
                <Input id={`slug-${faq.id}`} name="slug" value={faq.slug || ''} />
              </div>

              <div>
                <Label for={`locale-${faq.id}`}>Locale</Label>
                <Input id={`locale-${faq.id}`} name="locale" value={faq.locale || 'en'} />
              </div>

              <div>
                <Label for={`sort-${faq.id}`}>Sort order</Label>
                <Input id={`sort-${faq.id}`} name="sort_order" type="number" min="0" value={faq.sort_order ?? 0} />
              </div>

              <div class="flex flex-wrap items-center justify-between gap-2 md:col-span-2">
                <label for={`published-${faq.id}`} class="inline-flex items-center gap-2 text-sm">
                  <input
                    id={`published-${faq.id}`}
                    type="checkbox"
                    name="is_published"
                    checked={Boolean(faq.is_published)}
                  />
                  Published
                </label>

                <div class="flex gap-2">
                  <Button type="submit" variant="outline">Save</Button>
                </div>
              </div>
            </form>

            <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
              <form method="POST" action="?/togglePublished">
                <input type="hidden" name="id" value={faq.id} />
                <input type="hidden" name="current" value={faq.is_published ? 'true' : 'false'} />
                <Button type="submit" variant="secondary" size="sm">
                  {faq.is_published ? 'Unpublish' : 'Publish'}
                </Button>
              </form>

              <form
                method="POST"
                action="?/delete"
                onsubmit={event => {
                  if (!confirm('Delete this FAQ?')) {
                    event.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="id" value={faq.id} />
                <Button type="submit" variant="destructive" size="sm">Delete</Button>
              </form>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
</div>
