# Rocketbase Copilot Instructions

> **Package manager**: Use **pnpm** only. Never use npm or yarn.

## Project Overview

**Rocketbase** is a TypeScript/Node.js CLI tool that rapidly scaffolds production-ready full-stack applications using **PocketBase** (backend) and **SvelteKit** (frontend). It automates the entire setup process from dependency installation to development environment configuration.

### Project Goals

- **Zero-config setup**: Production-ready PocketBase + SvelteKit app in minutes
- **Best practices**: Modern tooling, type safety, and excellent developer experience
- **Platform-aware**: Auto-detect and install correct PocketBase binary for user's platform
- **Interactive**: Guide users through setup with prompts and progress indicators
- **Git-ready**: Initialize repository and create first commit automatically

### Repository Structure

- `cli/` — CLI source code (TypeScript/Node.js)
- `template/` — SvelteKit project template (source of truth for scaffolded projects)
- `.github/copilot/agents/` — AI instructions

**Critical Rule:** Never build routes/components directly in generated projects. Build them in `template/`, then the CLI copies them into new projects.

---

---

## Issue Tracking with Beads

This project uses **bd** (beads) for issue tracking. All work should be tracked through beads.

### Quick Reference

```bash
bd onboard            # First-time setup and introduction
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id> --reason "Description"  # Complete work
bd sync               # Force sync with git
```

### Workflow

1. **Find work**: `bd ready --json`
2. **Claim issue**: `bd update bd-XXX --status in_progress --json`
3. **Read details**: `bd show bd-XXX --json`
4. **Implement**: Build the feature/fix
5. **Close issue**: `bd close bd-XXX --reason "Implemented feature X" --json`
6. **Commit**: `git commit -m "feat: add feature X (bd-XXX)"`
7. **Sync**: `bd sync` (at end of session)

### Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create beads issues for any follow-up tasks
2. **Run quality gates** (if code changed):
   ```bash
   pnpm lint
   pnpm test
   cd cli && pnpm build
   cd template && pnpm build
   ```
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**

- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

---

---

## CLI Development (TypeScript/Node.js)

The CLI tool (in `cli/`) is the scaffolding engine that creates new Rocketbase projects.

### Toolchain

- **tsx** — Development execution and watch mode
- **tsup** — Production build
- **oxlint** / **oxfmt** — Fast linting and formatting
- **vitest** — Unit testing
- **consola** — Beautiful logging
- **execa** — Process execution
- **prompts** — Interactive user input
- **ora** — Progress spinners

### Development Workflow

```bash
# Run CLI in development
cd cli
tsx src/index.ts

# Watch mode
tsx watch src/index.ts

# Build for production
pnpm build

# Lint and format
pnpm lint
pnpm lint:fix

# Test
pnpm test
pnpm test:watch
```

### CLI Implementation Patterns

**Always:**

- Use **consola** for all output (info, success, error, warn)
- Use **execa** or **$** for shell command execution
- Use **prompts** for user input
- Use **ora** for long-running tasks with spinners
- Handle errors with clear messages and non-zero exit codes
- Validate all user inputs
- Test platform-specific code on macOS, Linux, and Windows

**Example:**

```typescript
import consola from 'consola';
import { execa } from 'execa';
import prompts from 'prompts';
import ora from 'ora';

// User input
const response = await prompts({
  type: 'text',
  name: 'projectName',
  message: 'What would you like to name your project?',
  initial: 'my-app'
});

// Long-running task
const spinner = ora('Installing dependencies...').start();
try {
  await execa('pnpm', ['install'], { cwd: projectPath });
  spinner.succeed('Dependencies installed');
} catch (error) {
  spinner.fail('Failed to install dependencies');
  consola.error(error);
  process.exit(1);
}
```

---

---

## Template Development (SvelteKit + PocketBase)

The template (in `template/`) is the **source of truth** for all scaffolded projects. The CLI copies these files and applies final configuration.

### Tech Stack

**Core Framework:**

- **SvelteKit** - Full-stack web framework with SSR, file-based routing, and API routes
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool

**Backend:**

- **PocketBase** - Embedded backend with SQLite, real-time subscriptions, auth, and file storage
- **pocketbase-typegen** - Generate TypeScript types from PocketBase schema

**UI & Styling:**

- **Tailwind CSS** - Utility-first CSS framework
- **shadcn-svelte** - Copy-paste component library (neutral base color)
- **@lucide/svelte** - Icon library
- **tailwindcss-animate** - Animation utilities
- **@tailwindcss/forms** - Better form styling
- **@tailwindcss/typography** - Prose styling
- **@tailwindcss/aspect-ratio** - Aspect ratio utilities

**Forms & Validation:**

- **zod** - Schema validation
- **sveltekit-superforms** - Form handling with validation
- **@formkit/tempo** - Date/time utilities

**Utilities:**

- **radashi** - Modern utility library (Lodash alternative)
- **consola** - Beautiful logging
- **cookie** - Cookie parsing
- **sveltekit-helmet** - SEO meta tags

**SVG Support:**

- **@poppa/sveltekit-svg** - Import SVGs as components

**Testing:**

- **vitest** - Unit testing
- **playwright** - E2E testing

**Development Tools:**

- **oxlint** - Fast Rust-based linter
- **oxfmt** - Fast Rust-based formatter
- **oxlint-tsgolint** - TypeScript-specific lint rules

### Template File Structure

```
template/
├── src/
│   ├── lib/
│   │   ├── components/ui/     # shadcn-svelte components
│   │   ├── server/
│   │   │   └── pocketbase.ts  # PocketBase client instance
│   │   ├── stores/            # Svelte stores
│   │   └── utils/             # Utility functions
│   ├── routes/                # SvelteKit routes
│   │   ├── +page.svelte       # Home page
│   │   ├── +layout.svelte     # Root layout
│   │   └── api/
│   │       └── pb/[...path]/+server.ts  # PocketBase API proxy
│   ├── app.css                # Global styles (Tailwind)
│   ├── app.html               # HTML template
│   └── hooks.server.ts        # SvelteKit server hooks
├── static/                     # Static assets
├── tests/                      # Playwright tests
├── pb_data/                    # PocketBase data (git-ignored)
├── package.json
├── svelte.config.js           # SvelteKit configuration
├── vite.config.ts             # Vite configuration
├── tailwind.config.js         # Tailwind configuration
└── tsconfig.json              # TypeScript configuration
```

### SvelteKit Scaffolding (Template Source)

When rebuilding the template, use `pnpx sv create` with these choices:

- **Template**: minimal
- **Type checking**: TypeScript
- **Add-ons**:
  - `devtools-json` - DevTools integration
  - `svelte-mcp` - MCP integration
  - `paraglide` - i18n
  - `playwright` - E2E testing
  - `tailwindcss` - CSS framework
  - `vitest` - Unit testing

### Required Configuration

**1. Adapter Configuration** (`svelte.config.js`):

```javascript
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter()
  }
};
```

**2. SVG Plugin** (`vite.config.ts`):

```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import svg from '@poppa/sveltekit-svg';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    sveltekit(),
    svg()
  ]
});
```

**3. pnpm Native Dependencies** (`package.json`):

```json
{
  "pnpm": {
    "onlyBuiltDependencies": [
      "@tailwindcss/oxide",
      "core-js",
      "esbuild",
      "sqlite3"
    ]
  }
}
```

**4. Package Scripts** (`package.json`):

```json
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
import PocketBase from 'pocketbase';

export const pb = new PocketBase('http://127.0.0.1:8090');

export function createPocketBaseClient(fetch?: typeof globalThis.fetch) {
  return new PocketBase('http://127.0.0.1:8090', fetch);
}
```

**2. API Proxy Route** (`src/routes/api/pb/[...path]/+server.ts`):

This enables client-side PocketBase access through SvelteKit, handling auth cookies and avoiding CORS:

```typescript
import type { RequestHandler } from './$types';

const POCKETBASE_URL = 'http://127.0.0.1:8090';

export const GET: RequestHandler = async ({ params, request, cookies }) => {
  return proxyRequest('GET', params.path, request, cookies);
};

export const POST: RequestHandler = async ({ params, request, cookies }) => {
  return proxyRequest('POST', params.path, request, cookies);
};

export const PATCH: RequestHandler = async ({ params, request, cookies }) => {
  return proxyRequest('PATCH', params.path, request, cookies);
};

export const DELETE: RequestHandler = async ({ params, request, cookies }) => {
  return proxyRequest('DELETE', params.path, request, cookies);
};

async function proxyRequest(
  method: string,
  path: string,
  request: Request,
  cookies: any
): Promise<Response> {
  const url = `${POCKETBASE_URL}/api/${path}`;
  const headers = new Headers(request.headers);
  
  // Forward auth cookie
  const authCookie = cookies.get('pb_auth');
  if (authCookie) {
    headers.set('Authorization', authCookie);
  }
  
  const body = method !== 'GET' ? await request.text() : undefined;
  
  const response = await fetch(url, {
    method,
    headers,
    body
  });
  
  return response;
}
```

**Client-side usage:**

```typescript
import PocketBase from 'pocketbase';

const pb = new PocketBase('/api/pb');
const posts = await pb.collection('posts').getFullList();
```

**3. Auth Handling** (`src/hooks.server.ts`):

```typescript
import type { Handle } from '@sveltejs/kit';
import { pb } from '$lib/server/pocketbase';

export const handle: Handle = async ({ event, resolve }) => {
  const authCookie = event.cookies.get('pb_auth');
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
import type { PageServerLoad } from './$types';
import { pb } from '$lib/server/pocketbase';

export const load: PageServerLoad = async () => {
  const posts = await pb.collection('posts').getFullList({
    sort: '-created'
  });
  return { posts };
};
```

**Form Actions** (`+page.server.ts`):

```typescript
import type { Actions } from './$types';
import { pb } from '$lib/server/pocketbase';
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
  create: async ({ request }) => {
    const data = await request.formData();
    const title = data.get('title')?.toString();

    if (!title) return fail(400, { title, missing: true });
    
    try {
      const post = await pb.collection('posts').create({
        title,
        content: data.get('content')?.toString()
      });
      return { success: true, post };
    } catch (error) {
      return fail(400, { error: error.message });
    }
  }
};
```

**Superforms with Validation**:

```typescript
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
```

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

### Template Development Workflow

```bash
# Start SvelteKit dev server
cd template
pnpm dev

# Start PocketBase (in another terminal)
cd template
pocketbase serve

# Run tests
pnpm test
pnpm test:e2e

# Build
pnpm build
pnpm preview
```

### Environment Variables

Create `.env` in template (for reference):

```bash
PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
PUBLIC_SITE_URL=http://localhost:5173
SECRET_API_KEY=your-secret-key
```

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

---

## MCP Server Preferences

When working with this project, **always prefer using MCP servers** for documentation and implementation guidance:

### Available MCP Servers

1. **SvelteKit MCP Server** (`mcp_sveltekit_*`)
   - Use `mcp_sveltekit_list-sections` to discover documentation
   - Use `mcp_sveltekit_get-documentation` to fetch specific sections
   - Use `mcp_sveltekit_svelte-autofixer` to validate Svelte code before returning it

2. **shadcn-svelte MCP Server** (`mcp_shadcn-svelte_*`)
   - Use `mcp_shadcn-svelte_shadcnSvelteGetTool` for component documentation
   - Use `mcp_shadcn-svelte_shadcnSvelteListTool` to list available components
   - Use `mcp_shadcn-svelte_shadcnSvelteSearchTool` to search for specific components

3. **PocketBase MCP Server** (`mcp_pocketbaseser_*`)
   - Use for collection management, record operations, and auth workflows
   - Prefer this over generic documentation when working with PocketBase

4. **beads MCP Server** (`mcp_beads_*`)
   - Available for issue tracking and workflow management
   - Provides programmatic access to beads operations

### MCP Workflow

**When implementing SvelteKit features:**

1. Run `mcp_sveltekit_list-sections` first to see available docs
2. Identify relevant sections based on the feature
3. Fetch documentation with `mcp_sveltekit_get-documentation`
4. Implement the feature
5. Validate with `mcp_sveltekit_svelte-autofixer` before committing

**When adding UI components:**

1. Search with `mcp_shadcn-svelte_shadcnSvelteSearchTool`
2. Get component details with `mcp_shadcn-svelte_shadcnSvelteGetTool`
3. Follow the documentation to add the component to the template

**When working with PocketBase:**

1. Use PocketBase MCP server for collection operations
2. Reference the server-side patterns documented above
3. Test with the development PocketBase instance

---

## CLI Scaffolding Workflow

The CLI performs these steps when creating a new project:

### 1. Check/Install PocketBase Binary

- Detect platform (macOS, Linux, Windows) and architecture (arm64, amd64)
- Check if `pocketbase` is in PATH
- If not found, download from GitHub releases and install
- Verify installation
- Download URL pattern: `https://github.com/pocketbase/pocketbase/releases/download/vX.X.X/pocketbase_X.X.X_{platform}_{arch}.zip`

### 2. Prompt for Project Name

- Ask user for project directory name
- Validate directory name (allow `-`, `_`, alphanumeric)
- Default: `my-app`

### 3. Scaffold SvelteKit Project

```bash
pnpx sv create <project-name>
```

- Template: minimal
- Type checking: TypeScript
- Add-ons: devtools-json, svelte-mcp, paraglide, playwright, tailwindcss, vitest

### 4. Initialize Git

```bash
cd <project-name>
git init
git add .
git commit -m "chore: initial commit from rocketbase"
```

### 5. Initialize PocketBase

```bash
pocketbase serve  # Start to create pb_data
# Stop after initialization
echo "pb_data" >> .gitignore
git add .gitignore
git commit -m "chore: add pb_data to gitignore"
```

### 6. Create PocketBase Admin User

- Prompt for admin email and password
- Validate email format
- Create superuser: `pocketbase superuser create <email> <password>`
- Display admin URL: http://127.0.0.1:8090/_/

### 7. Install Dependencies

```bash
# Development tools
pnpm add -D oxlint oxfmt oxlint-tsgolint

# Template dependencies
pnpm add -D @poppa/sveltekit-svg @tailwindcss/aspect-ratio \
  @tailwindcss/forms @tailwindcss/typography pocketbase-typegen \
  @lucide/svelte zod sveltekit-superforms @formkit/tempo \
  consola cookie radashi sveltekit-helmet

# Production dependencies
pnpm add pocketbase sqlite3
```

### 8. Configure shadcn-svelte

```bash
pnpm dlx shadcn-svelte@latest init -c . --base-color neutral --css ./src/app.css
pnpm add -D tailwindcss-animate
```

### 9. Configure Adapters and Plugins

- Update `svelte.config.js` with adapter-node
- Update `vite.config.ts` with SVG plugin
- Add pnpm native dependencies config to `package.json`
- Update package scripts for linting: `oxlint && oxfmt`

### 10. Add PocketBase API Proxy

- Create `src/routes/api/pb/[...path]/+server.ts`
- Create `src/lib/server/pocketbase.ts`
- Create `src/hooks.server.ts`

### 11. Final Commit

```bash
git add .
git commit -m "chore: complete rocketbase initialization"
```

### 12. Display Success Message

```
🚀 Rocketbase project initialized successfully!

Project: <project-name>
PocketBase Admin: http://127.0.0.1:8090/_/

Next steps:
  cd <project-name>
  pnpm dev              # Start SvelteKit (localhost:5173)
  pocketbase serve      # Start PocketBase (in another terminal)

Your app will be running at:
  Frontend: http://localhost:5173
  Backend:  http://127.0.0.1:8090
  Admin:    http://127.0.0.1:8090/_/
```

---

## Versioning & Releases

Follow **Semantic Versioning**, **Conventional Commits**, and **Keep a Changelog**.

### Conventional Commits

```
feat: add new template scaffolding step
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

### Template Tests

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

## Common Tasks

### Adding a New CLI Command

1. Create beads issue: `bd create "Add command X" -t task -p 2`
2. Implement in `cli/src/commands/`
3. Update CLI argument parser
4. Add tests in `cli/tests/`
5. Update documentation
6. Close issue and commit: `git commit -m "feat: add command X (bd-XXX)"`

### Adding a Template Feature

1. Create beads issue: `bd create "Add feature Y to template" -t task -p 2`
2. Implement in `template/src/`
3. Test locally: `cd template && pnpm dev`
4. Add tests (unit or e2e)
5. Update template documentation (`template/LLM_INSTRUCTIONS.md`)
6. Close issue and commit: `git commit -m "feat: add feature Y to template (bd-XXX)"`

### Updating Dependencies

1. Create beads issue: `bd create "Update dependencies" -t chore -p 3`
2. Update in both `cli/` and `template/`
3. Test functionality in both projects
4. Run quality gates (lint, test, build)
5. Close issue and commit

---

## Quality Checklist

Before closing any beads issue and pushing:

- [ ] Code follows project conventions
- [ ] Tests pass: `pnpm test`
- [ ] Linter passes: `pnpm lint`
- [ ] Build succeeds: `pnpm build`
- [ ] Documentation updated (README.md, LLM_INSTRUCTIONS.md)
- [ ] Beads issue closed with descriptive reason
- [ ] Commit includes issue ID: `(bd-XXX)`
- [ ] Changes pushed to remote: `git push`
- [ ] Verified `git status` shows "up to date with origin"

---

## Resources

- **SvelteKit**: https://svelte.dev/docs/kit
- **PocketBase**: https://pocketbase.io/docs/
- **shadcn-svelte**: https://www.shadcn-svelte.com/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vitest**: https://vitest.dev/
- **Playwright**: https://playwright.dev/
- **beads**: Use `bd onboard` for introduction

---

## Support

For issues or questions:

1. Check existing beads issues: `bd list`
2. Create new beads issue: `bd create "Question: ..." -t task -p 2`
3. Reference project documentation:
   - CLI development: This file
   - Template development: `template/LLM_INSTRUCTIONS.md`
4. Use MCP servers for framework-specific questions:
   - **SvelteKit**: `mcp_sveltekit_list-sections` then `mcp_sveltekit_get-documentation`
   - **shadcn-svelte**: `mcp_shadcn-svelte_shadcnSvelteSearchTool`
   - **PocketBase**: Use `mcp_pocketbaseser_*` tools
   - **beads**: Use `mcp_beads_*` tools for programmatic access

