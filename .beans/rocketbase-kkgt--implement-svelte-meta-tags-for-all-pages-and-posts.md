---
# rocketbase-kkgt
title: Implement svelte-meta-tags for all pages and posts
status: completed
type: feature
priority: normal
created_at: 2026-02-14T04:19:27Z
updated_at: 2026-02-14T04:33:39Z
---

Add SEO meta tags using svelte-meta-tags library across all pages and posts in the application


## Summary of Changes

Implemented svelte-meta-tags across all pages and posts in the application:

### Base Meta Tags (Layout)
- Updated `+layout.server.ts` to load site-wide metadata from PocketBase metadata collection
- Modified `+layout.svelte` to use `MetaTags` component with reactive base configuration
- Base tags include: site title, description, canonical URL, OpenGraph, and Twitter card data

### Page-Specific Meta Tags
Replaced `<svelte:head>` with `MetaTags` component in:
- **Posts detail page** (`/posts/[slug]`): Article-specific tags with author, tags, images, and dates
- **Posts index page** (`/posts`): Overview page with basic meta tags
- **Pages (CMS)** (`PageContent.svelte`): Dynamic page meta tags with images
- **Home page** (`/`): Site homepage meta tags
- **Tags pages** (`/tags`, `/tags/[slug]`): Tag listing and detail pages
- **Auth pages**: Login, Register, Account settings

### Features Implemented
- ✅ Reactive meta tags using `` (Svelte 5)
- ✅ OpenGraph support for social sharing
- ✅ Twitter card support
- ✅ Article metadata for blog posts (authors, tags, dates)
- ✅ Canonical URLs for all pages
- ✅ Image tags for posts and pages
- ✅ Site-wide metadata from PocketBase

### Testing
- Updated all test files to include new `url` and `metadata` fields
- All TypeScript checks passing (0 errors)
- Linter passing (pre-existing warnings unrelated to changes)

### Files Modified
- `app/src/routes/+layout.server.ts`
- `app/src/routes/+layout.svelte`
- `app/src/routes/+page.svelte`
- `app/src/routes/posts/[slug]/+page.svelte`
- `app/src/routes/posts/+page.svelte`
- `app/src/routes/tags/+page.svelte`
- `app/src/routes/tags/[slug]/+page.svelte`
- `app/src/routes/login/+page.svelte`
- `app/src/routes/register/+page.svelte`
- `app/src/routes/account/+page.svelte`
- `app/src/lib/components/PageContent.svelte`
- Test files: `page.svelte.spec.ts`, `account/page.svelte.spec.ts`, `login/page.svelte.spec.ts`, `register/page.svelte.spec.ts`



## Additional Changes (Post-Completion)

Added metadata population to ensure the metadata collection is populated with default values:

### Files Added
- **Migration**: `db/pb_migrations/1771043492_populate_default_metadata.js`
  - Automatically populates metadata collection on PocketBase startup
  - Creates default entries for: site_title, site_description, og_image, twitter_site, twitter_handle
  - Safe to run multiple times (checks for existing entries before inserting)
  
- **Utility Script**: `db/util/populate-metadata.js`
  - Manual utility to populate metadata if needed
  - Can be run with: `node db/util/populate-metadata.js`

### Default Metadata Values
The migration creates these default metadata entries:
- `site_title`: "Rocketbase"
- `site_description`: "A production-ready full-stack application built with PocketBase and SvelteKit"
- `og_image`: "" (empty, to be customized)
- `twitter_site`: "" (empty, to be customized)
- `twitter_handle`: "" (empty, to be customized)

These values can be customized in the PocketBase admin panel at any time.
