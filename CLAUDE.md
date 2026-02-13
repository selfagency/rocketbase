# Rocketbase Development Instructions

> **Package manager**: Use **pnpm** only. Never use npm or yarn.

## Project Overview

**Rocketbase** is a production-ready full-stack web application built with **PocketBase** (backend) and **SvelteKit** (frontend). It provides a complete foundation for content management, user authentication, admin dashboards, and background job processing.

### Project Goals

- **Production-ready foundation**: Full-stack app with auth, CMS, admin panels, and background jobs
- **Best practices**: Modern tooling, type safety, comprehensive testing, and excellent DX
- **Scalable architecture**: Monorepo with separate frontend, backend, CLI tools, and sidecar services
- **Developer experience**: Fast development with hot reload, type safety, and excellent tooling

### Repository Structure

- `app/` — SvelteKit frontend application (main web app with pages, posts, admin routes)
- `cli/` — CLI tooling for project management, scaffolding, and utilities
- `db/` — PocketBase database, migrations, hooks, and TypeScript type definitions
- `sidecar/` — Background services for queue processing, email, and scheduled tasks
- `docker/` — Docker configuration for development services (OpenTelemetry proxy, etc.)
- `.beans/` — Issue tracking and task management with beans
- `.github/` — CI/CD workflows and documentation

**Development Philosophy:** This is a working full-stack application. Build features in `app/`, backend logic in `db/`, and background services in `sidecar/`. The CLI tools are for project management, not scaffolding.

---

## Issue Tracking with Beans

This project uses the `beans` CLI (Beans) for issue tracking. All work should be tracked using Beans and the `.beans/` directory.

### Mandatory Beans + Commits Policy

**Every feature, bug fix, chore, refactor, or documentation change MUST:**

1. **Create a beans issue first** (or link to an existing one)
2. **Move it to in_progress** before coding
3. **Close it with a descriptive reason** when done
4. **Create a commit** that includes the bean ID in the message

**No exceptions.** If you cannot use beans or create a commit, stop and ask the user to decide how to proceed.

### Quick Reference

```bash
beans init            # Initialize Beans in this repository
beans list            # List available beans (work)
beans show <id>       # View bean details
beans update <id>     # Update a bean's properties (e.g. mark in_progress)
beans create "..."   # Create a new bean
beans prime           # Output agent instructions / sync context for coding agents
```

### Workflow

1. **Find work**: `beans list`
2. **Claim work**: `beans update <id>` (set status or add an assignee as needed)
3. **Read details**: `beans show <id>`
4. **Implement**: Build the feature/fix
5. **Close bean**: `beans update <id>` (set status=done or archive)
6. **Commit**: `git commit -m "feat: add feature X (bean-<id>)"`
7. **Prime agents / push**: run `beans prime`, then commit and push the `.beans/` directory so agents see changes

### Example Sequence (Required)

```bash
beans create "Add 2FA opt-in toggle"
beans update <id> --set status=in_progress
beans show <id>

# implement changes

beans update <id> --set status=done
git add .beans && git commit -m "feat: add 2FA opt-in toggle (bean-<id>)"
beans prime
```

### Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. Run quality gates (if code changed):

```bash
pnpm lint
pnpm test
cd cli && pnpm build
cd app && pnpm build
# If sidecar code changed
cd sidecar && pnpm build  # if changed
```

1. Update issue status — close finished work, update in-progress items.

1. PUSH TO REMOTE — This is MANDATORY:

```bash
git pull --rebase
beans prime   # refresh agent context / prime payloads
git add .beans
git commit -m "chore: update beans"
git push
git status  # MUST show "up to date with origin"
```

1. Clean up — clear stashes, prune remote branches.

1. Verify — all changes committed AND pushed.

**CRITICAL RULES:**

- Work is NOT complete until `git push` succeeds.
- NEVER stop before pushing — that leaves work stranded locally.
- NEVER say "ready to push when you are" — YOU must push.
- If push fails, resolve and retry until it succeeds.

---

## Application Architecture

### Frontend Application (`app/`)

The SvelteKit application contains all frontend code, routes, components, and UI.

**Key Directories:**

- `src/lib/components/` — Reusable components (shadcn-svelte UI components, global components)
- `src/lib/components/ui/` — shadcn-svelte component library, avoid editing as much as possible (Button, Form, Table, etc.)
- `src/lib/components/global/` — Global components (Nav, Toaster)
- `src/lib/server/` — Server-only code (PocketBase client, logging)
- `src/lib/stores/` — Svelte stores (screen state, toast notifications)
- `src/lib/types/` — TypeScript type definitions (PocketBase types, app types)
- `src/routes/` — SvelteKit file-based routes

**Current Routes:**

- `/` — Home page
- `/login`, `/register`, `/logout` — Authentication
- `/forgot-password`, `/verify-email/[token]` — Password reset and email verification
- `/account` — User account settings (profile, password, MFA)
- `/posts` — Blog posts index
- `/posts/[slug]` — Individual post pages
- `/admin/pages` — Admin dashboard for page management (CRUD operations)
- `/[...slug]` — Dynamic page rendering (catch-all for CMS pages)

**Implemented Features:**

- User authentication with email verification
- Password reset flow
- Account settings with multiple forms
- Admin page management with hierarchical display
- Dynamic page routing with SEO metadata
- Dark mode support (mode-watcher)
- Toast notifications (svelte-sonner)
- Internationalization (Paraglide)

### Backend (`db/`)

PocketBase handles all backend operations including database, auth, file storage, and real-time subscriptions.

**Structure:**

- `pb_data/` — SQLite database and uploaded files (git-ignored)
- `pb_migrations/` — Database schema migrations
- `pb_hooks/` — Server-side hooks for audit logging, type generation, and business logic
- `types.d.ts` — Generated TypeScript types from PocketBase schema

**Collections:**

- `users` — User accounts with roles, MFA, and profile data
- `pages` — CMS pages with hierarchy, SEO metadata, and publishing workflow
- `posts` — Blog posts with tags, metadata, and author relationships
- `metadata` — Site-wide metadata (title, description, OpenGraph data)
- `tags` — Taxonomy for posts
- `redirects` — URL redirect management
- `audit_logs` — Comprehensive audit trail
- `queue_*` — Background job queue collections

**Hooks:**

- `01-generate-types.pb.js` — Auto-generate TypeScript types on schema changes
- `02-08-audit-*.pb.js` — Audit logging for create, update, delete, and auth events

### Sidecar Services (`sidecar/`)

Background services for asynchronous task processing.

**Services:**

- Queue processing using `pocketbase-queue`
- Email sending via SMTP (using `@upyo/smtp`)
- tRPC API for inter-service communication
- Scheduled task execution

**Tech Stack:**

- TypeScript with Node.js
- tRPC for type-safe API calls
- LogLayer for structured logging
- Consola for beautiful console output

### CLI Tools (`cli/`)

**Future Development:** A CLI will be developed later to assist with project configuration, installation, scaffolding, and common development tasks.

### Tech Stack

**Frontend:**

- SvelteKit 2.x, Svelte 5.x, TypeScript (strict), Vite 7.x

**UI & Styling:**

- Tailwind CSS 4.x
- shadcn-svelte (Bits UI primitives)
- Lucide icons (`@lucide/svelte`)

**Forms & Validation:**

- Zod 4.x
- sveltekit-superforms 2.x
- formsnap (where used)

**Testing:**

- Vitest 4.x (unit)
- Playwright (E2E)
- vitest-browser-svelte for browser/SSR component tests

**Observability:**

- OpenTelemetry (traces/metrics)
- LogLayer for structured logging
- Pino for server logs

**Backend:**

- PocketBase 0.26.x
- pocketbase-typegen for TS types
- sqlite3 for storage

**Sidecar / Services:**

- Node.js (LTS)
- @trpc/server for RPC endpoints
- pocketbase-queue for background jobs
- @upyo/smtp (email)

**Utilities & Dev Tools:**

- radashi, consola, @formkit/tempo
- oxfmt / oxlint for formatting & linting
- pnpm workspace (monorepo)

This section lists the primary, production-intended stack and recommended versions used across the repository.

### Application File Structure

A concise view of the actual repository layout and the purpose of each top-level application folder:

```txt
app/         # SvelteKit frontend application (pages, routes, components, tests)
  ├─ src/
  │  ├─ lib/           # shared components, server helpers, stores, types
  │  ├─ routes/        # SvelteKit routes (+page.svelte, +server.ts files)
  ├─ tests/            # Vitest and Playwright tests for the app
  ├─ package.json

db/          # PocketBase backend data, migrations, hooks, and generated types
  ├─ pb_data/          # SQLite database + uploads (git-ignored)
  ├─ pb_hooks/         # PocketBase hooks (audit, typegen, etc.)
  ├─ pb_migrations/    # Schema migrations

sidecar/     # Background services (queue processors, email, scheduled tasks)
  ├─ src/
  ├─ package.json
```

The `app/` folder is the primary frontend application. Use `app/` when referring to application code and `cli/` for project tooling.

### Required Configuration

**1. Adapter Configuration** (`svelte.config.js`):

```javascript
import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
  },
};
```

```typescript
import { sveltekit } from "@sveltejs/kit/vite";
import svg from "@poppa/sveltekit-svg";
import { defineConfig } from "vite";
{
    "onlyBuiltDependencies": [
      "@tailwindcss/oxide",
      "core-js",

{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:watch": "vitest watch",
    "test:e2e": "playwright test",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
    "lint": "oxlint && oxfmt",
    "lint:fix": "oxlint --fix && oxfmt --write",
    "add-ui": "pnpx shadcn-svelte@latest add"
  }
}
```

### PocketBase Integration

**1. Server-Only Client** (`src/lib/server/pocketbase.ts`):

```typescript
import PocketBase from "pocketbase";

export const pb = new PocketBase("http://127.0.0.1:8090");

export function createPocketBaseClient(fetch?: typeof globalThis.fetch) {
  return new PocketBase("http://127.0.0.1:8090", fetch);
}
```

**2. API Proxy Route** (`src/routes/api/pb/[...path]/+server.ts`):

This enables client-side PocketBase access through SvelteKit, handling auth cookies and avoiding CORS:

```typescript
import type { RequestHandler } from "./$types";

const POCKETBASE_URL = "http://127.0.0.1:8090";

export const GET: RequestHandler = async ({ params, request, cookies }) => {
  return proxyRequest("GET", params.path, request, cookies);
};

export const POST: RequestHandler = async ({ params, request, cookies }) => {
  return proxyRequest("POST", params.path, request, cookies);
};

export const PATCH: RequestHandler = async ({ params, request, cookies }) => {
  return proxyRequest("PATCH", params.path, request, cookies);
};

export const DELETE: RequestHandler = async ({ params, request, cookies }) => {
  return proxyRequest("DELETE", params.path, request, cookies);
};

async function proxyRequest(
  method: string,
  path: string,
  request: Request,
  cookies: any,
): Promise<Response> {
  const url = `${POCKETBASE_URL}/api/${path}`;
  const headers = new Headers(request.headers);

  // Forward auth cookie
  const authCookie = cookies.get("pb_auth");
  if (authCookie) {
    headers.set("Authorization", authCookie);
  }

  const body = method !== "GET" ? await request.text() : undefined;

  const response = await fetch(url, {
    method,
    headers,
    body,
  });

  return response;
}
```

**Client-side usage:**

```typescript
import PocketBase from "pocketbase";

const pb = new PocketBase("/api/pb");
const posts = await pb.collection("posts").getFullList();
```

**3. Auth Handling** (`src/hooks.server.ts`):

```typescript
import type { Handle } from "@sveltejs/kit";
import { pb } from "$lib/server/pocketbase";

export const handle: Handle = async ({ event, resolve }) => {
  const authCookie = event.cookies.get("pb_auth");
  if (authCookie) {
    pb.authStore.loadFromCookie(authCookie);
  }

  event.locals.user = pb.authStore.model;
  return resolve(event);
};
```

### SvelteKit Development Patterns

**Server Load Functions** (`+page.server.ts`):

```typescript
import type { PageServerLoad } from "./$types";
import { pb } from "$lib/server/pocketbase";

export const load: PageServerLoad = async () => {
  const posts = await pb.collection("posts").getFullList({
    sort: "-created",
  });
  return { posts };
};
```

**Form Actions** (`+page.server.ts`):

```typescript
import type { Actions } from "./$types";
import { pb } from "$lib/server/pocketbase";
import { fail } from "@sveltejs/kit";

export const actions: Actions = {
  create: async ({ request }) => {
    const data = await request.formData();
    const title = data.get("title")?.toString();

    if (!title) return fail(400, { title, missing: true });

    try {
      const post = await pb.collection("posts").create({
        title,
        content: data.get("content")?.toString(),
      });
      return { success: true, post };
    } catch (error) {
      return fail(400, { error: error.message });
    }
  },
};
```

**Superforms with Validation**:

```typescript
import { superValidate } from "sveltekit-superforms/server";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
});

export const load: PageServerLoad = async () => {
  const form = await superValidate(schema);
  return { form };
};
```

**Superforms Guidance**:

- Prefer `superValidate` on the server with the `zod4` adapter and `superForm` on the client.
- Use stable `id` values when multiple forms exist on a page.
- Avoid wrapping `superForm` initializations in `$derived` to prevent re-initialization loops.
- Use `resetForm: false` when you need to keep user input after actions.

**Using shadcn-svelte**:

```bash
# Add components
pnpm dlx shadcn-svelte@latest add button

# Import in Svelte files
import { Button } from '$lib/components/ui/button';
```

**Using SVGs**:

```svelte
<script lang="ts">
  import Logo from '$lib/assets/logo.svg?component';
  import IconUrl from '$lib/assets/icon.svg?url';
</script>

<Logo class="w-32 h-32" />
<img src={IconUrl} alt="Icon" />
```

### Development Workflow

Start the local development environment across the services (suggested three terminals):

```bash
# Terminal 1: PocketBase (db)
pnpm db

# Terminal 2: SvelteKit app
cd app && pnpm dev

# Terminal 3: Optional sidecar services
cd sidecar && pnpm dev
```

### Environment Variables

Create a `.env` in `app/` (example). This project does not use a separate "SECRET_API_KEY" variable — the expected variables are listed below:

```dotenv
PUBLIC_POCKETBASE_URL="http://localhost:8090"
API_KEY="<your-api-key-or-jwt>"
ZIPKIN_URL=http://localhost:9411/api/v2/spans
SERVICE_NAME=rocketbase-app
```

### Docker Compose (dev & test) and local services

There are two docker-compose files at the repo root used for local development and test runs:

- `docker-compose.dev.yml` — used to bring up supporting development services (detached):
  - mailpit (SMTP + UI)
  - pocketbase (uses `ghcr.io/muchobien/pocketbase:latest`, mounts `db/pb_*` folders)
  - zipkin and an OpenTelemetry collector (for traces)
  - run with `docker-compose -f docker-compose.dev.yml up -d` (healthchecks are configured)

- `docker-compose.test.yml` — used for test CI/local test runs and includes:
  - mailpit
  - pocketbase (with admin creds set via environment)
  - rocketbase (built from `app/Dockerfile`, exposed on port 3000)
  - run with `docker-compose -f docker-compose.test.yml up --build`

Notes:

- pocketbase uses the `muchobien` image which runs HTTP on port 8090 (recommended for tests).
- `docker-compose.dev.yml` also exposes Zipkin/collector for tracing during development.

### app/ pnpm scripts (quick reference)

Key scripts defined in `app/package.json`:

- `pnpm dev` — start the dev server (Vite) for the SvelteKit app.
- `pnpm dev:services` — start supporting dev services in background via `docker-compose -f ../docker-compose.dev.yml up -d`.
- `pnpm dev:services:down` — stop those services.
- `pnpm dev:trace` — enable tracing and run the dev server (sets `ENABLE_TRACING=1`).
- `pnpm build` — build the frontend for production (Vite build).
- `pnpm build:types` — generate PocketBase types with `pocketbase-typegen` (uses `../db/pb_data/data.db`).
- `pnpm preview` — run `vite preview` to serve a production build locally.
- `pnpm check` / `pnpm check:watch` — run `svelte-kit sync` + `svelte-check` (static checks and types).
- `pnpm format` — run `oxfmt` and `prettier` to format code.
- `pnpm lint` / `pnpm lint:fix` — run `oxlint` (and fix) across the app.

- Testing helpers:
  - `pnpm test` — runs node/browser/e2e test suites (`test:node`, `test:browser`, `test:e2e`).
  - `pnpm test:setup` — starts test services (`./util/start-test-services.sh`).
  - `pnpm test:cleanup` — cleans up test users via `util/cleanup-test-users.js`.
  - `pnpm test:node` / `pnpm test:browser` — run vitest for node and browser configs.
  - `pnpm test:e2e` — run Playwright tests.

- Utility:
  - `pnpm add-ui` — helper to add shadcn-svelte components (`pnpx shadcn-svelte@latest add`).

These are the most commonly used scripts during development and CI; consult `app/package.json` for the full list.

### .gitignore Additions

```gitignore
pb_data
.svelte-kit
build
.env
.env.*
!.env.example
```

---

## ⚠️ CRITICAL: Always Check Documentation Before Implementing

**You MUST check the official documentation for ANY library, framework, or tool BEFORE implementing code.**

### Why This Matters

- AI systems can hallucinate APIs, methods, and patterns that don't exist
- Documentation is the source of truth - your knowledge will be outdated or incomplete
- An extra 2 minutes reading docs saves 20 minutes debugging incorrect implementations

### How To Do This

1. **For Svelte/SvelteKit**: Always use `mcp_sveltekit_list-sections` and `mcp_sveltekit_get-documentation`
2. **For shadcn-svelte**: Use `mcp_shadcn-svelte_shadcnSvelteSearchTool` to verify components exist
3. **For PocketBase**: Use `mcp_pocketbaseser_*` tools or check official docs
4. **For other libraries**: Use MCP servers `cognitionai/deepwiki`, `context7`, and `exa` to search for directions

### Examples of Common Hallucinations

- Assuming component props exist without checking shadcn-svelte docs
- Using PocketBase API methods that aren't in the official API reference
- Creating SvelteKit forms without checking superforms docs
- Assuming email verification links have a specific format without checking the implementation

**If you cannot find documentation for something, ask the user or try a simple test before assuming the pattern.**

---

## MCP Server Preferences

When working with this project, prefer using the available MCP servers and tools for accurate, up-to-date documentation and code guidance. The project integrates with several MCP toolsets — call the specific tool name when you need to retrieve docs or validate code.

### Available MCP servers / tools

- `mcp__Sveltekit__*` — SvelteKit documentation and helpers (use list-sections, get-documentation, svelte-autofixer)
- `mcp__shadcn-svelte__*` — shadcn-svelte component docs, search and get tools
- `mcp__Context7__*` — Context7 documentation retrieval for popular libraries
- `mcp__microsoftdocs_mcp__*` — Microsoft docs MCP accessors
- `mcp__io_github_ChromeDevTools_chrome-devtools-mcp__*` — Chrome DevTools / browser instrumentation docs
- `mcp__plugin_playwright_playwright__*` — Playwright documentation and test guidance
- `mcp__cognitionai_deepwiki__*` — DeepWiki / repository docs (question answering)
- `mcp__Calculator__calculate` — Calculator/evaluator for simple expressions

Notes:

- Beans has no MCP server — use the `beans` CLI for issue management and commit `.beans/` into the repo for agent integration (`beans prime`).

### Typical MCP workflow

1. Identify the domain (SvelteKit, shadcn-svelte, PocketBase, Playwright, etc.)
2. Call the corresponding MCP tool (e.g. `mcp__Sveltekit__*` or `mcp__shadcn-svelte__*`) to fetch docs or validate code
3. Implement using the official guidance
4. Validate Svelte files with the Svelte autofixer and run tests

<!-- CLI scaffolding workflow removed: this repository is the application itself, not a standalone scaffolding CLI. -->

## Versioning & Releases

Follow **Semantic Versioning**, **Conventional Commits**, and **Keep a Changelog**.

### Conventional Commits

```txt
feat: add new app feature
fix(cli): handle missing pocketbase binary
chore(deps): update oxlint
docs: update README with new features
```

### Changelog

Maintain `CHANGELOG.md` with an **Unreleased** section during development. Move changes into versioned sections when releasing.

### Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md` (move Unreleased to version section)
3. Commit: `chore: release v1.0.0`
4. Tag: `git tag v1.0.0`
5. Push: `git push && git push --tags`
6. Publish: `pnpm publish`

---

## Testing Standards

### CLI Tests

- Test all platform-specific code paths
- Mock file system operations
- Test error handling
- Verify output formatting
- Use vitest for unit tests

### App Tests

- Unit tests with Vitest
- E2E tests with Playwright
- Test PocketBase integration
- Test form validation
- Test auth workflows

### Integration Tests

- Test full CLI workflow
- Verify generated project structure
- Ensure all dependencies install correctly
- Test PocketBase initialization
- Verify all configuration files are correct

---

### Common Tasks

### Adding a New CLI Command

1. Create a bean: `beans create "Add command X" -t task -p 2`
2. Implement in `cli/src/commands/`
3. Update CLI argument parser
4. Add tests in `cli/tests/`
5. Update documentation
6. Close issue and commit: `git commit -m "feat: add command X (bean-<id>)"`

### Adding an App Feature

1. Create a bean: `beans create "Add feature Y to app" -t task -p 2`
2. Implement in `app/src/`
3. Test locally: `cd app && pnpm dev`
4. Add tests (unit or e2e)
5. Update app documentation
6. Close issue and commit: `git commit -m "feat: add feature Y to app (bean-<id>)"`

### Updating Dependencies

1. Create a bean: `beans create "Update dependencies" -t chore -p 3`
2. Update in both `cli/` and `app/` (and `sidecar/` if relevant)
3. Test functionality in updated projects
4. Run quality gates (lint, test, build)
5. Close issue and commit

---

## Quality Checklist

Before closing any beans issue and pushing:

- [ ] Code follows project conventions
- [ ] Tests pass: `pnpm test`
- [ ] Linter passes: `pnpm lint`
- [ ] Build succeeds: `pnpm build`
- [ ] Documentation updated
- [ ] Bean closed with descriptive reason
- [ ] Commit includes issue ID: `(bean-<id>)`
- [ ] Changes pushed to remote: `git push`
- [ ] Verified `git status` shows "up to date with origin"

---

## Skills Available

This repository exposes 100+ agent skills for SvelteKit, PocketBase, UI, testing, and developer workflows. Notable examples include:

- `svelte-expert`, `svelte-code-writer`, `svelte-components`
- `sveltekit-data-flow`, `sveltekit-remote-functions`
- `pocketbase` — Comprehensive PocketBase development skill
- `ui-styling`, `ui-ux-pro-max`
- `typescript-advanced-types`
- `test-driven-development`, `systematic-debugging`
- `superpowers:*` — Meta skills for workflow management

Use these skills when working on domain-specific tasks (component creation, form handling, PocketBase schema changes, testing, and debugging).

---

## Resources

- **SvelteKit**: <https://svelte.dev/docs/kit>
- **PocketBase**: <https://pocketbase.io/docs/>
- **shadcn-svelte**: <https://www.shadcn-svelte.com/>
- **sveltekit-superforms**: <https://superforms.rocks/>
- **Tailwind CSS**: <https://tailwindcss.com/docs>
- **Vitest**: <https://vitest.dev/>
- **Playwright**: <https://playwright.dev/>
- **beans**: Use `beans init` for introduction

---

## Support

For issues or questions:

1. Check existing beans issues: `beans list`
2. Create new bean: `beans create "Question: ..." -t task -p 2`
3. Reference project documentation
4. Use MCP servers for framework-specific questions
