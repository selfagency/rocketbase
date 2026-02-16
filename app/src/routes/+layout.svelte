<script lang="ts">
  import { onNavigate } from '$app/navigation';
  import Nav from '$lib/components/global/Nav.svelte';
  import Toaster from '$lib/components/global/Toaster.svelte';
  import { getLocale } from '$lib/paraglide/runtime';
  import { setScreenSize } from '$lib/stores/screen';
  import type { Snippet } from 'svelte';
  import { MetaTags } from 'svelte-meta-tags';
  import '../app.css';

  let {
    children,
    data,
  }: {
    children: Snippet;
    data: { navItems?: any[]; metadata?: Record<string, string>; url?: string };
  } = $props();

  let innerWidth = $state(0);
  let innerHeight = $state(0);

  $effect(() => {
    if (innerWidth > 0) {
      setScreenSize(innerWidth, innerHeight);
    }
  });

  onNavigate(navigation => {
    if (!document.startViewTransition) return;

    return new Promise(resolve => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });

  // Base meta tags for all pages (reactive)
  const baseMetaTags = $derived({
    title: data.metadata?.site_title || 'Rocketbase',
    titleTemplate: `%s | ${data.metadata?.site_title || 'Rocketbase'}`,
    description: data.metadata?.site_description || 'A production-ready full-stack application',
    canonical: data.url,
    openGraph: {
      type: 'website',
      url: data.url,
      siteName: data.metadata?.site_title || 'Rocketbase',
      title: data.metadata?.site_title || 'Rocketbase',
      description: data.metadata?.site_description || 'A production-ready full-stack application',
      locale: getLocale(),
      images: data.metadata?.og_image
        ? [
            {
              url: data.metadata.og_image,
              width: 1200,
              height: 630,
              alt: data.metadata?.site_title || 'Rocketbase',
            },
          ]
        : [],
    },
    additionalMetaTags: [
      ...(data.metadata?.fediverse_handle
        ? [{ property: 'fediverse:creator', content: data.metadata.fediverse_handle }]
        : []),
      ...(data.metadata?.bluesky_handle ? [{ name: 'bluesky:actor', content: data.metadata.bluesky_handle }] : []),
    ],
    additionalLink: [
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        href: '/feed/rss',
        title: 'Rocketbase RSS Feed',
      },
      {
        rel: 'alternate',
        type: 'application/json',
        href: '/feed/json',
        title: 'Rocketbase JSON Feed',
      },
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: data.metadata?.site_title || 'Rocketbase',
      description: data.metadata?.site_description,
      url: data.url,
    },
  });
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<MetaTags {...baseMetaTags} />
<Toaster />

<a href="#main-content" class="skip-link">Skip to main content</a>

<Nav navItems={data.navItems || []} />

<main id="main-content" class="page-shell" tabindex="-1">
  {@render children()}
</main>
