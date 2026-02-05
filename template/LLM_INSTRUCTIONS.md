# Project Instructions: SvelteKit + PocketBase Application

> **Note**: This file should be copied to the root of newly generated projects as `LLM_INSTRUCTIONS.md` or `.github/copilot-instructions.md`

## Project Overview

This is a **full-stack web application** created by [Rocketbase](https://github.com/yourusername/rocketbase), combining:

- **SvelteKit** (Frontend & API) - Modern full-stack web framework
- **PocketBase** (Backend) - Open-source backend with real-time database, authentication, and file storage
- **Tailwind CSS** + **shadcn-svelte** - Styling and component library
- **TypeScript** - Type-safe development

---

## Tech Stack

### Core Framework

- **SvelteKit** - Full-stack web framework with:
  - File-based routing
  - Server-side rendering (SSR)
  - API routes
  - Load functions for data fetching
  - Form actions
  - Hooks for request handling

### Backend

- **PocketBase** - Embedded backend providing:
  - SQLite database with real-time subscriptions
  - Built-in authentication (email/password, OAuth)
  - File storage
  - Admin dashboard at `http://127.0.0.1:8090/_/`
  - REST API
  - Real-time database subscriptions

### UI & Styling

- **Tailwind CSS** - Utility-first CSS framework
- **shadcn-svelte** - Copy-paste component library
  - Components in `src/lib/components/ui/`
  - Headless UI with Tailwind styling
  - Base color: `neutral`
- **tailwindcss-animate** - Animation utilities
- **@tailwindcss/forms** - Better form styling
- **@tailwindcss/typography** - Typography plugin for prose
- **@tailwindcss/aspect-ratio** - Aspect ratio utilities
- **@lucide/svelte** - Icon library

### Development Tools

- **oxlint** - Fast Rust-based linter
- **oxfmt** - Fast Rust-based formatter
- **oxlint-tsgolint** - TypeScript-specific lint rules
- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing
- **pocketbase-typegen** - Generate TypeScript types from PocketBase schema

### Utilities

- **zod** - Schema validation
- **sveltekit-superforms** - Form handling with validation
- **@formkit/tempo** - Date/time utilities
- **radashi** - Modern utility library (Lodash alternative)
- **consola** - Beautiful logging
- **cookie** - Cookie parsing
- **sveltekit-helmet** - SEO meta tags

### Additional Features

- **@poppa/sveltekit-svg** - Import SVGs as components
- **paraglide** - Internationalization (i18n)
- **svelte-mcp** - Model Context Protocol integration

---

## Project Structure

```
├── pb_data/                    # PocketBase data (git-ignored)
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   └── ui/            # shadcn-svelte components
│   │   ├── server/            # Server-only code
│   │   │   └── pocketbase.ts  # PocketBase client instance
│   │   ├── stores/            # Svelte stores
│   │   └── utils/             # Utility functions
│   ├── routes/                # SvelteKit routes
│   │   ├── +page.svelte       # Home page
│   │   ├── +layout.svelte     # Root layout
│   │   └── api/               # API routes
│   ├── app.css                # Global styles (Tailwind)
│   └── app.html               # HTML template
├── static/                     # Static assets
├── tests/                      # Playwright tests
├── package.json
├── svelte.config.js           # SvelteKit configuration
├── vite.config.ts             # Vite configuration
├── tailwind.config.js         # Tailwind configuration
├── playwright.config.ts       # Playwright configuration
└── tsconfig.json              # TypeScript configuration
```

---

## Development Workflow

### Starting the Development Servers

You need **two terminal windows**:

**Terminal 1 - SvelteKit Dev Server:**
```bash
pnpm dev
```
- Frontend: http://localhost:5173
- Auto-reloads on file changes

**Terminal 2 - PocketBase Server:**
```bash
pocketbase serve
```
- Backend API: http://127.0.0.1:8090
- Admin Dashboard: http://127.0.0.1:8090/_/

### Other Commands

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview

# Run linter and formatter
pnpm lint

# Auto-fix lint issues
pnpm lint:fix

# Run unit tests
pnpm test

# Run unit tests in watch mode
pnpm test:watch

# Run e2e tests
pnpm test:e2e

# Type checking
pnpm check

# Type checking in watch mode
pnpm check:watch
```

---

## Working with PocketBase

### PocketBase Client Setup

Create a server-only PocketBase client instance:

**`src/lib/server/pocketbase.ts`:**
```typescript
import PocketBase from 'pocketbase';

// Server-only PocketBase instance
export const pb = new PocketBase('http://127.0.0.1:8090');

// For server-side requests with user context
export function createPocketBaseClient(fetch?: typeof globalThis.fetch) {
  return new PocketBase('http://127.0.0.1:8090', fetch);
}
```

### Using PocketBase in Server Load Functions

**`src/routes/+page.server.ts`:**
```typescript
import type { PageServerLoad } from './$types';
import { pb } from '$lib/server/pocketbase';

export const load: PageServerLoad = async () => {
  // Fetch data from PocketBase
  const posts = await pb.collection('posts').getFullList({
    sort: '-created',
    expand: 'author'
  });

  return {
    posts
  };
};
```

### Using PocketBase in API Routes

**`src/routes/api/posts/+server.ts`:**
```typescript
import type { RequestHandler } from './$types';
import { pb } from '$lib/server/pocketbase';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
  const posts = await pb.collection('posts').getFullList();
  return json(posts);
};

export const POST: RequestHandler = async ({ request }) => {
  const data = await request.json();
  const post = await pb.collection('posts').create(data);
  return json(post, { status: 201 });
};
```

### Authentication

**Login:**
```typescript
// In a form action - src/routes/login/+page.server.ts
import type { Actions } from './$types';
import { pb } from '$lib/server/pocketbase';
import { fail, redirect } from '@sveltejs/kit';

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get('email')?.toString();
    const password = data.get('password')?.toString();

    if (!email || !password) {
      return fail(400, { message: 'Email and password required' });
    }

    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      
      // Store auth token in cookie
      cookies.set('pb_auth', pb.authStore.exportToCookie(), {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });

      throw redirect(303, '/dashboard');
    } catch (err) {
      return fail(400, { message: 'Invalid credentials' });
    }
  }
};
```

**Check Auth in Hooks:**
```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { pb } from '$lib/server/pocketbase';

export const handle: Handle = async ({ event, resolve }) => {
  // Load auth from cookie
  const authCookie = event.cookies.get('pb_auth');
  if (authCookie) {
    pb.authStore.loadFromCookie(authCookie);
  }

  // Make user available to routes
  event.locals.user = pb.authStore.model;

  return resolve(event);
};
```

### Real-time Subscriptions

**Client-side subscription:**
```svelte
<script lang="ts">
  import PocketBase from 'pocketbase';
  import { onMount, onDestroy } from 'svelte';

  const pb = new PocketBase('http://127.0.0.1:8090');
  let posts = [];

  onMount(async () => {
    // Initial fetch
    posts = await pb.collection('posts').getFullList();

    // Subscribe to changes
    pb.collection('posts').subscribe('*', (e) => {
      if (e.action === 'create') {
        posts = [...posts, e.record];
      } else if (e.action === 'update') {
        posts = posts.map(p => p.id === e.record.id ? e.record : p);
      } else if (e.action === 'delete') {
        posts = posts.filter(p => p.id !== e.record.id);
      }
    });
  });

  onDestroy(() => {
    pb.collection('posts').unsubscribe();
  });
</script>
```

### Generating TypeScript Types

After creating or modifying collections in PocketBase admin:

```bash
# Generate types from PocketBase schema
pnpm exec pocketbase-typegen --db ./pb_data/data.db --out src/lib/types/pocketbase.ts
```

Then import and use:

```typescript
import type { PostsResponse, UsersResponse } from '$lib/types/pocketbase';

const post: PostsResponse = await pb.collection('posts').getOne('RECORD_ID');
```

---

## Working with SvelteKit

### Routing

SvelteKit uses **file-based routing**:

- `src/routes/+page.svelte` → `/`
- `src/routes/about/+page.svelte` → `/about`
- `src/routes/blog/[slug]/+page.svelte` → `/blog/hello-world`
- `src/routes/api/posts/+server.ts` → `/api/posts`

### Loading Data

**Server Load (runs on server):**
```typescript
// +page.server.ts
import type { PageServerLoad } from './$types';
import { pb } from '$lib/server/pocketbase';

export const load: PageServerLoad = async () => {
  const posts = await pb.collection('posts').getFullList();
  return { posts };
};
```

**Universal Load (runs on both server and client):**
```typescript
// +page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
  const res = await fetch(`/api/posts/${params.id}`);
  const post = await res.json();
  return { post };
};
```

### Form Actions

**Define actions:**
```typescript
// +page.server.ts
import type { Actions } from './$types';
import { pb } from '$lib/server/pocketbase';
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
  create: async ({ request }) => {
    const data = await request.formData();
    const title = data.get('title')?.toString();

    if (!title) {
      return fail(400, { title, missing: true });
    }

    await pb.collection('posts').create({ title });
    return { success: true };
  }
};
```

**Use in component:**
```svelte
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  export let form: ActionData;
</script>

<form method="POST" action="?/create" use:enhance>
  <input type="text" name="title" required />
  {#if form?.missing}
    <p class="error">Title is required</p>
  {/if}
  <button type="submit">Create Post</button>
</form>
```

### Using Superforms (Recommended)

Superforms provides better form handling with validation:

```typescript
// +page.server.ts
import { superValidate } from 'sveltekit-superforms/server';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(3),
  content: z.string().min(10)
});

export const load: PageServerLoad = async () => {
  const form = await superValidate(schema);
  return { form };
};

export const actions: Actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, schema);

    if (!form.valid) {
      return fail(400, { form });
    }

    await pb.collection('posts').create(form.data);
    return { form };
  }
};
```

```svelte
<script lang="ts">
  import { superForm } from 'sveltekit-superforms/client';

  export let data;

  const { form, errors, enhance } = superForm(data.form);
</script>

<form method="POST" use:enhance>
  <input bind:value={$form.title} name="title" />
  {#if $errors.title}<span class="error">{$errors.title}</span>{/if}

  <textarea bind:value={$form.content} name="content"></textarea>
  {#if $errors.content}<span class="error">{$errors.content}</span>{/if}

  <button type="submit">Submit</button>
</form>
```

---

## Working with shadcn-svelte

### Adding Components

```bash
# Add a component
pnpm dlx shadcn-svelte@latest add button

# Add multiple components
pnpm dlx shadcn-svelte@latest add card dialog dropdown-menu
```

Components are copied to `src/lib/components/ui/` and can be customized.

### Using Components

```svelte
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Card Title</Card.Title>
    <Card.Description>Card description</Card.Description>
  </Card.Header>
  <Card.Content>
    <p>Card content goes here</p>
  </Card.Content>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card.Root>
```

---

## Working with SVGs

Import SVGs as Svelte components:

```svelte
<script lang="ts">
  import Logo from '$lib/assets/logo.svg?component';
  import IconUrl from '$lib/assets/icon.svg?url';
</script>

<!-- As component -->
<Logo class="w-32 h-32" />

<!-- As URL -->
<img src={IconUrl} alt="Icon" />
```

---

## Environment Variables

### Development

Create `.env` file in project root:

```bash
# PocketBase
PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090

# Other public vars (exposed to client)
PUBLIC_SITE_URL=http://localhost:5173

# Private vars (server-only)
SECRET_API_KEY=your-secret-key
```

### Usage

```typescript
// Public variables (available on client and server)
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

// Private variables (server-only)
import { SECRET_API_KEY } from '$env/static/private';
```

### Production

Set environment variables in your hosting platform (Vercel, Netlify, etc.)

---

## Styling Guidelines

### Tailwind CSS

Use Tailwind utility classes for styling:

```svelte
<div class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
    Welcome
  </h1>
  <p class="mt-4 text-lg text-gray-600 dark:text-gray-300">
    Description text
  </p>
</div>
```

### Custom Styles

For component-specific styles, use `<style>` blocks:

```svelte
<style lang="postcss">
  .custom-card {
    @apply rounded-lg border bg-card p-6 shadow-sm;
  }
</style>
```

---

## Testing

### Unit Tests (Vitest)

**`src/lib/utils/format.test.ts`:**
```typescript
import { describe, it, expect } from 'vitest';
import { formatDate } from './format';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2026-01-01');
    expect(formatDate(date)).toBe('January 1, 2026');
  });
});
```

### E2E Tests (Playwright)

**`tests/home.spec.ts`:**
```typescript
import { expect, test } from '@playwright/test';

test('home page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});

test('can navigate to about page', async ({ page }) => {
  await page.goto('/');
  await page.click('text=About');
  await expect(page).toHaveURL('/about');
});
```

---

## Building for Production

### Build

```bash
pnpm build
```

This creates:
- Optimized client bundle
- Server-side code for Node.js adapter
- Output in `build/` directory

### Preview

```bash
pnpm preview
```

Test the production build locally.

### Deployment

#### With PocketBase Embedded

1. Build SvelteKit app
2. Copy `build/` directory to server
3. Copy `pocketbase` executable to server
4. Start both:
   ```bash
   ./pocketbase serve &
   node build/index.js
   ```

#### With PocketBase Hosted Separately

Deploy SvelteKit to platforms like:
- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **Cloudflare Pages**: `wrangler pages deploy build`

Update `PUBLIC_POCKETBASE_URL` to point to hosted PocketBase instance.

---

## Best Practices

### Security

1. **Never expose PocketBase admin credentials**
2. **Use environment variables** for sensitive data
3. **Validate user input** on both client and server
4. **Set proper CORS** in PocketBase settings
5. **Use HTTPS** in production
6. **Set httpOnly cookies** for auth tokens

### Performance

1. **Use server load functions** for initial data
2. **Implement pagination** for large datasets
3. **Use real-time subscriptions** sparingly
4. **Optimize images** with Vite's image processing
5. **Lazy load components** with dynamic imports

### Code Organization

1. **Server-only code** in `src/lib/server/`
2. **Shared utilities** in `src/lib/utils/`
3. **Components** in `src/lib/components/`
4. **Types** in `src/lib/types/`
5. **One component per file** in routes

### Type Safety

1. **Generate PocketBase types** after schema changes
2. **Use Zod schemas** for form validation
3. **Type your load functions** with `PageServerLoad`, `PageLoad`
4. **Type your API routes** with `RequestHandler`

---

## Common Patterns

### Protected Routes

```typescript
// src/routes/dashboard/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(303, '/login');
  }

  return {
    user: locals.user
  };
};
```

### Error Handling

```typescript
// +error.svelte
<script lang="ts">
  import { page } from '$app/stores';
</script>

<div class="error-page">
  <h1>{$page.status}</h1>
  <p>{$page.error?.message || 'An error occurred'}</p>
</div>
```

### Pagination

```svelte
<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  export let data;

  $: currentPage = Number($page.url.searchParams.get('page')) || 1;

  function nextPage() {
    goto(`?page=${currentPage + 1}`);
  }

  function prevPage() {
    goto(`?page=${currentPage - 1}`);
  }
</script>

{#each data.posts as post}
  <article>{post.title}</article>
{/each}

<div class="pagination">
  <button on:click={prevPage} disabled={currentPage === 1}>
    Previous
  </button>
  <span>Page {currentPage}</span>
  <button on:click={nextPage} disabled={!data.hasMore}>
    Next
  </button>
</div>
```

---

## Troubleshooting

### PocketBase Connection Issues

- Ensure PocketBase is running: `pocketbase serve`
- Check URL in `PUBLIC_POCKETBASE_URL`
- Verify CORS settings in PocketBase admin

### Type Errors

- Run `pnpm check` to see TypeScript errors
- Regenerate PocketBase types after schema changes
- Clear `.svelte-kit` cache: `rm -rf .svelte-kit`

### Build Errors

- Check Node.js version matches `engines` in package.json
- Clear node_modules: `rm -rf node_modules pnpm-lock.yaml && pnpm install`
- Verify all dependencies are installed

---

## Resources

- **SvelteKit**: https://svelte.dev/docs/kit
- **PocketBase**: https://pocketbase.io/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn-svelte**: https://www.shadcn-svelte.com/
- **Superforms**: https://superforms.rocks/
- **Vitest**: https://vitest.dev/
- **Playwright**: https://playwright.dev/

---

_This project was generated by Rocketbase. For questions or issues, refer to the [Rocketbase documentation](https://github.com/yourusername/rocketbase)._
