---
description: 'IndieWeb and Microformats development standards'
applyTo: '**/*.svelte, **/*.ts, **/*.js'
---

# IndieWeb and Microformats Best Practices

This document outlines the standards for implementing IndieWeb features and Microformats2 (mf2) in the Rocketbase project.

## Microformats2 (mf2)

Always use mf2 prefixed classes to provide machine-readable metadata.

### Root Classes (`h-*`)

- `h-entry`: Use for items that are timestamped (blog posts, status updates, pages).
- `h-card`: Use for people or organizations.
- `h-feed`: Use for listings of entries.
- `h-cite`: Use when citing or replying to another post.

### Property Prefixes

- `p-*`: Plain text (e.g., `p-name`, `p-summary`).
- `u-*`: URLs (e.g., `u-url`, `u-photo`).
- `dt-*`: Date/Time (e.g., `dt-published`, `dt-updated`).
- `e-*`: Embedded HTML (e.g., `e-content`).

### Common Patterns

#### Blog Post (Single)

```html
<article class="h-entry">
  <h1 class="p-name">Post Title</h1>
  <a href="..." class="u-url">
    <time class="dt-published" datetime="...">...</time>
  </a>
  <div class="e-content">...</div>
</article>
```

#### Author Card

```html
<div class="h-card">
  <img src="..." class="u-photo" alt="..." />
  <a href="..." class="p-name u-url" rel="me">Author Name</a>
  <p class="p-note">Biography...</p>
</div>
```

## Identity and Verification

- **Rel-Me**: Use `rel="me"` on links from a person's profile to their other silos (Twitter, GitHub, Personal Site) to establish identity.
- **Representative h-card**: Every site should have a representative `h-card` (usually on the home page or about page) that defines the site owner.

## Syndication and Sharing

- **POSSE**: (Publish (on) Own Site, Syndicate Elsewhere). Prioritize publishing on Rocketbase first, then syndicating to social platforms.
- **Permalinks**: Ensure every entry has a clear, accessible permalink.
- **Author Attribution**: Every post must be linked to its author using `p-author h-card`.

## Structured Data (JSON-LD)

While mf2 is the primary transport for IndieWeb tools, also provide Schema.org JSON-LD for mainstream search engines (Google, Bing).

- Use `BlogPosting` for posts.
- Use `Person` for authors.
- Use `WebSite` and `Organization` for global metadata.
