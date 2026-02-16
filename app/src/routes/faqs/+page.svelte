<script lang="ts">
  import { page } from '$app/state';
  import { MetaTags } from 'svelte-meta-tags';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const metaTags = $derived({
    title: 'FAQs',
    description: 'Frequently asked questions and answers.',
    canonical: `${page.url.origin}/faqs`,
    openGraph: {
      type: 'website',
      url: `${page.url.origin}/faqs`,
      title: 'FAQs',
      description: 'Frequently asked questions and answers.',
    },
  });
</script>

<MetaTags {...metaTags} />

<div class="mx-auto w-full max-w-4xl px-4 py-8 md:py-10">
  <header class="mb-8">
    <h1 class="mb-3 text-4xl font-bold tracking-tight">Frequently Asked Questions</h1>
    {#if !data.loadError && data.faqs.length > 0}
      <p class="text-muted-foreground">
        {data.faqs.length}
        {data.faqs.length === 1 ? ' question' : ' questions'}
      </p>
    {/if}
  </header>

  {#if data.loadError}
    <section class="rounded-lg border border-destructive/40 bg-destructive/5 p-4" aria-live="polite" aria-atomic="true">
      <h2 class="text-lg font-semibold text-destructive">Unable to load FAQs</h2>
      <p class="mt-1 text-sm text-muted-foreground">{data.loadError}</p>
    </section>
  {:else if data.faqs.length === 0}
    <section class="rounded-lg border border-border/70 p-6 text-center" aria-live="polite" aria-atomic="true">
      <h2 class="text-2xl font-semibold">No FAQs published yet</h2>
      <p class="mt-2 text-muted-foreground">Please check back soon for answers to common questions.</p>
    </section>
  {:else}
    <section aria-labelledby="faq-list-heading">
      <h2 id="faq-list-heading" class="sr-only">FAQ list</h2>
      <ul class="space-y-3">
        {#each data.faqs as faq (faq.id)}
          <li class="rounded-lg border border-border/70 bg-card px-4 py-3">
            <article id={faq.slug ? `faq-${faq.slug}` : undefined}>
              <details class="group">
                <summary
                  class="cursor-pointer list-none rounded-md py-1 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <span class="text-base font-semibold md:text-lg">{faq.question}</span>
                </summary>
                <div class="pt-3 text-sm leading-6 text-foreground/90">
                  <p class="whitespace-pre-wrap">{faq.answer}</p>
                </div>
              </details>
            </article>
          </li>
        {/each}
      </ul>
    </section>
  {/if}
</div>
