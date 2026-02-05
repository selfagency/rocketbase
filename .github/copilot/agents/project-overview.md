# Rocketbase Project Overview

## What is Rocketbase?

Rocketbase is a CLI tool that rapidly scaffolds a full-stack application using **PocketBase** (backend) and **SvelteKit** (frontend). It automates the entire setup process, from installing dependencies to configuring the development environment.

## Project Goals

- **Zero-config setup**: Get a production-ready PocketBase + SvelteKit app in minutes
- **Best practices**: Include modern tooling, type safety, and developer experience enhancements
- **Platform-aware**: Automatically detect and install the correct PocketBase binary for the user's platform
- **Interactive**: Guide users through setup with prompts and progress indicators
- **Git-ready**: Initialize repository and create the first commit automatically

---

## CLI Workflow

The CLI performs the following steps in order:

### 1. Check PocketBase Installation

**Check if PocketBase is installed:**

- Look for `pocketbase` executable in system PATH
- If not found, proceed to install it

**Install PocketBase (if needed):**

- Detect current platform (macOS, Linux, Windows)
- Detect architecture (arm64, amd64, etc.)
- Download the appropriate PocketBase binary from <https://pocketbase.io/docs/>
- Extract and install to appropriate location
- Verify installation

**Resources:**

- PocketBase releases: <https://github.com/pocketbase/pocketbase/releases>
- Download URL pattern: `https://github.com/pocketbase/pocketbase/releases/download/vX.X.X/pocketbase_X.X.X_{platform}_{arch}.zip`
- Platforms: `darwin`, `linux`, `windows`
- Architectures: `amd64`, `arm64`

### 2. Prompt for Project Name

**Ask user for project directory name:**

- Prompt: "What would you like to name your project?"
- Validate: Must be a valid directory name (no special characters except `-` and `_`)
- Default: `my-app`

### 3. Initialize SvelteKit Project

**Run SvelteKit scaffolding tool:**

```bash
pnpx sv create <project-name>
```

**Configuration options to select:**

- **Template**: Minimal (not demo app)
- **TypeScript**: Yes - using TypeScript syntax
- **Add-ons**:
  - `devtools-json` - DevTools integration
  - `svelte-mcp` - MCP integration (should be added to project's `mcp.json`)
  - `paraglide` - Internationalization
  - `playwright` - E2E testing
  - `tailwindcss` - CSS framework
  - `vitest` - Unit testing

**Reference:**

- SvelteKit CLI: <https://svelte.dev/docs/cli/sv-create>
- Use non-interactive flags if possible to automate the process

### 4. Navigate to Project Directory

```bash
cd <project-name>
```

All subsequent commands run inside the project directory.

### 5. Initialize Git Repository

```bash
git init
git add .
git commit -m "chore: initial commit from rocketbase"
```

### 6. Initialize PocketBase

**Start PocketBase to create initial files:**

```bash
pocketbase serve
```

- This creates the `pb_data` directory and initial database
- Terminate the process after initialization (use Ctrl+C or process kill)

**Add PocketBase data to .gitignore:**

```bash
echo "pb_data" >> .gitignore
```

**Commit .gitignore update:**

```bash
git add .gitignore
git commit -m "chore: add pb_data to gitignore"
```

### 7. Create PocketBase Admin User

**Prompt user for admin credentials:**

- Email: "Enter admin email:" (validate email format)
- Password: "Enter admin password:" (hidden input, minimum 8 characters)

**Create superuser using PocketBase CLI:**

```bash
pocketbase superuser create <email> <password>
```

**Verify creation:**

- Confirm user was created successfully
- Display success message with admin URL

### 8. Install Development Tools

**Install linting and formatting tools:**

```bash
pnpm add -D oxlint oxfmt oxlint-tsgolint
```

**Update package.json scripts:**

Add lint commands if not already present:

```json
{
  "scripts": {
    "lint": "oxlint && oxfmt",
    "lint:fix": "oxlint --fix && oxfmt --write"
  }
}
```

### 9. Initialize shadcn-svelte

**Install and configure shadcn-svelte:**

```bash
pnpm dlx shadcn-svelte@latest init -c . --base-color neutral --css ./src/app.css
```

**Configuration:**

- Component directory: Current directory (`.`)
- Base color: `neutral`
- CSS file: `./src/app.css`

**Install Tailwind CSS plugins:**

```bash
pnpm add -D tailwindcss-animate
```

### 10. Install Additional Dependencies

**Development dependencies:**

```bash
pnpm add -D @poppa/sveltekit-svg @tailwindcss/aspect-ratio @tailwindcss/forms @tailwindcss/typography pocketbase-typegen @lucide/svelte zod sveltekit-superforms @formkit/tempo consola cookie pocketbase radashi sveltekit-helmet
```

**Production dependencies:**

```bash
pnpm add sqlite3
```

### 11. Configure SvelteKit SVG Plugin

**Update `vite.config.js` (or `vite.config.ts`):**

Add the `@poppa/sveltekit-svg` plugin to Vite configuration:

```javascript
import { sveltekit } from '@sveltejs/kit/vite';
import svg from '@poppa/sveltekit-svg';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    sveltekit(),
    svg() // SVG import support
  ]
});
```

**Update `svelte.config.js` to use Node adapter:**

```javascript
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter()
  }
};

export default config;
```

### 12. Configure pnpm for Native Modules

**Update `package.json` to include `pnpm` configuration:**

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

This ensures native dependencies are built correctly.

### 13. Create PocketBase API Proxy

**Create API route for PocketBase proxy:**

Create `src/routes/api/pb/[...path]/+server.ts` to proxy all PocketBase API requests through SvelteKit:

```typescript
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';

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
  try {
    const url = new URL(request.url);
    const targetUrl = `${POCKETBASE_URL}/api/${path}${url.search}`;

    // Forward all headers from the original request
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      // Skip host header
      if (key.toLowerCase() !== 'host') {
        headers.set(key, value);
      }
    });

    // Get auth token from cookie and add to Authorization header
    const authCookie = cookies.get('pb_auth');
    if (authCookie) {
      try {
        const authData = JSON.parse(authCookie);
        if (authData.token) {
          headers.set('Authorization', `Bearer ${authData.token}`);
        }
      } catch (e) {
        // Invalid cookie format, continue without auth
      }
    }

    // Prepare request options
    const options: RequestInit = {
      method,
      headers,
    };

    // Include body for POST, PATCH requests
    if (method !== 'GET' && method !== 'DELETE') {
      const contentType = request.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        options.body = await request.text();
      } else if (contentType?.includes('multipart/form-data')) {
        options.body = await request.formData();
      } else {
        options.body = await request.text();
      }
    }

    // Make the proxied request
    const response = await fetch(targetUrl, options);

    // Return the response with original headers
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (err) {
    console.error('PocketBase proxy error:', err);
    throw error(500, 'Failed to proxy request to PocketBase');
  }
}
```

**This enables client-side PocketBase access:**

- All PocketBase API calls go through `/api/pb/*`
- Client-side code uses auth cookies automatically
- No CORS issues
- Auth tokens are handled via cookies, not exposed to client

**Example client-side usage:**

```typescript
// In any Svelte component
import PocketBase from 'pocketbase';

const pb = new PocketBase('/api/pb');

// All requests now go through SvelteKit proxy
const posts = await pb.collection('posts').getFullList();
```

### 14. Final Git Commit

```bash
git add .
git commit -m "chore: complete rocketbase initialization"
```

### 15. Display Success Message

Show completion message with next steps:

```
🚀 Rocketbase project initialized successfully!

Project: <project-name>
PocketBase Admin: http://127.0.0.1:8090/_/

Next steps:
  cd <project-name>
  pnpm dev          # Start SvelteKit dev server
  pocketbase serve  # Start PocketBase (in another terminal)

Your app will be running at:
  Frontend: http://localhost:5173
  Backend:  http://127.0.0.1:8090
  Admin:    http://127.0.0.1:8090/_/
```

---

## Technologies & Dependencies

### Core Stack

- **PocketBase**: Open-source backend (Go)
  - Real-time database
  - Authentication
  - File storage
  - Admin dashboard
- **SvelteKit**: Frontend framework (JavaScript/TypeScript)
  - SSR and SSG support
  - File-based routing
  - API routes

### Development Tools

- **oxlint**: Fast Rust-based linter
- **oxfmt**: Fast Rust-based formatter
- **oxlint-tsgolint**: TypeScript-specific linting rules
- **tsx**: TypeScript execution for development
- **tsup**: Build tool for the CLI itself
- **vitest**: Unit testing
- **playwright**: E2E testing

### UI & Styling

- **Tailwind CSS**: Utility-first CSS framework
- **shadcn-svelte**: Component library (headless UI components)
- **tailwindcss-animate**: Animation utilities
- **@tailwindcss/aspect-ratio**: Aspect ratio utilities
- **@tailwindcss/forms**: Form styling
- **@tailwindcss/typography**: Typography plugin
- **@lucide/svelte**: Icon library

### Utilities

- **zod**: TypeScript-first schema validation
- **sveltekit-superforms**: Form handling for SvelteKit
- **@formkit/tempo**: Date/time utilities
- **radashi**: Modern Lodash alternative
- **consola**: Beautiful console logging
- **cookie**: Cookie parsing
- **sveltekit-helmet**: SEO meta tags

### PocketBase Integration

- **pocketbase**: JavaScript SDK for PocketBase
- **pocketbase-typegen**: Generate TypeScript types from PocketBase schema
- **sqlite3**: SQLite driver (PocketBase uses SQLite)

### Additional Tools

- **@poppa/sveltekit-svg**: SVG import support for SvelteKit
- **paraglide**: Internationalization (i18n)
- **svelte-mcp**: Model Context Protocol integration

---

## Configuration Files

### package.json Scripts (Expected)

```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:watch": "vitest watch",
    "test:e2e": "playwright test",
    "lint": "oxlint && oxfmt",
    "lint:fix": "oxlint --fix && oxfmt --write",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
    "add-ui": "pnpx shadcn-svelte@latest add"
  },
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

### .gitignore (Additions)

```gitignore
pb_data
.svelte-kit
build
.env
.env.*
!.env.example
```

---

## Expected File Structure

After completion, the project should have this structure:

```
project-name/
├── pb_data/                      # PocketBase data (git-ignored)
├── src/
│   ├── lib/
│   │   └── components/
│   │       └── ui/               # shadcn-svelte components
│   ├── routes/
│   │   ├── api/
│   │   │   └── pb/
│   │   │       └── [...path]/
│   │   │           └── +server.ts # PocketBase API proxy
│   │   └── +page.svelte          # Home page
│   └── app.css                   # Global styles with Tailwind
├── static/                       # Static assets
├── tests/                        # Playwright tests
├── .gitignore
├── mcp.json                      # MCP configuration
├── package.json                  # Includes pnpm.onlyBuiltDependencies
├── pnpm-lock.yaml
├── playwright.config.ts
├── svelte.config.js              # SvelteKit config with node adapter
├── tailwind.config.js            # Tailwind configuration
├── tsconfig.json
└── vite.config.ts                # Vite config with @poppa/sveltekit-svg
```

```

---

## CLI Implementation Notes

### Error Handling

- Validate all user inputs
- Check for existing directories before creating
- Verify PocketBase installation success
- Handle network errors during downloads
- Provide clear error messages with recovery instructions

### User Experience

- Use **ora** for progress spinners during long operations
- Use **consola** for all console output (success, info, error messages)
- Use **prompts** for interactive user input
- Show estimated time for longer operations
- Provide context about what's happening at each step

### Platform Detection

```typescript
import os from 'node:os';

const platform = os.platform(); // 'darwin', 'linux', 'win32'
const arch = os.arch();         // 'x64', 'arm64'

// Map to PocketBase naming
const pbPlatform = platform === 'darwin' ? 'darwin' :
                   platform === 'win32' ? 'windows' : 'linux';
const pbArch = arch === 'x64' ? 'amd64' : 'arm64';
```

### Process Management

```typescript
import { execa } from 'execa';

// Start PocketBase temporarily
const pb = execa`pocketbase serve`;

// Wait for initialization (check for pb_data directory)
await waitForDirectory('pb_data');

// Terminate
pb.kill('SIGTERM');
```

---

## Future Enhancements (Not in Current Scope)

These may be added in future versions:

- Database schema scaffolding
- API route generation
- Component templates
- Authentication setup helpers
- Deployment configurations
- Docker support
- Monorepo support

---

_This document describes the Rocketbase CLI functionality. For development guidelines, see `copilot-instructions.md`._
