# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Rocketbase** is a TypeScript/Node.js CLI tool that scaffolds production-ready full-stack applications using **PocketBase** (backend) and **SvelteKit** (frontend). The project has two main components:

- `cli/` — CLI scaffolding tool (TypeScript/Node.js)
- `template/` — SvelteKit + PocketBase project template

**Critical Rule:** Never build routes/components directly in generated projects. Build them in `template/`, then the CLI copies them into new projects.

## Package Manager

**Always use `pnpm`**. Never use npm or yarn.

## Development Commands

### CLI Development (`cli/`)

```bash
cd cli
pnpm dev              # Run CLI in development mode (tsx)
tsx watch src/index.ts  # Watch mode
pnpm build            # Build for production (tsup)
pnpm lint             # Run linter and formatter (oxlint + oxfmt)
pnpm lint:fix         # Auto-fix lint issues
pnpm test             # Run unit tests (vitest)
pnpm test:watch       # Run tests in watch mode
```

### Template Development (`template/`)

```bash
cd template
pnpm dev              # Start SvelteKit dev server (localhost:5173)
pnpm pb               # Start PocketBase server (port 8090)
pnpm build            # Build for production
pnpm build:types      # Generate TypeScript types from PocketBase schema
pnpm preview          # Preview production build
pnpm check            # Type-check with svelte-check
pnpm test             # Run all tests
pnpm test:unit        # Run unit tests (vitest)
pnpm test:e2e         # Run E2E tests (Playwright)
pnpm add-ui           # Add shadcn-svelte components
```

### Root-Level Operations

```bash
pnpm lint             # Lint entire project
cd cli && pnpm build  # Build CLI
cd template && pnpm build  # Build template
```

## High-Level Architecture

### Monorepo Structure

This is a pnpm workspace with two packages:

1. **CLI Package** (`cli/`) — Scaffolding engine
   - Entry point: `cli/src/index.ts` (currently minimal, will expand)
   - Built with `tsup` to `dist/` directory
   - Dependencies: `tsx`, `execa`, `consola`, `ora`, `prompts`

2. **Template Package** (`template/`) — Source of truth for scaffolded projects
   - Standard SvelteKit project structure
   - Pre-configured with PocketBase integration, Tailwind, shadcn-svelte
   - The CLI copies this entire directory when creating new projects

### Template Architecture

**Frontend Stack:**
- SvelteKit 5 with TypeScript
- Tailwind CSS 4 with shadcn-svelte components (neutral base color)
- Vite 7 with custom plugins (SVG support, Paraglide i18n, MCP dev tools)
- Vitest for unit testing (browser mode with Playwright for component tests, node mode for server tests)
- Playwright for E2E testing

**Backend Integration:**
- PocketBase server runs separately on port 8090
- PocketBase JavaScript client (`pocketbase` npm package)
- Type generation from PocketBase schema via `pocketbase-typegen`
- No API proxy route needed — direct client-side usage

**Key Template Files:**
- `src/hooks.server.ts` — SvelteKit server hooks (auth handling)
- `src/hooks.ts` — Client hooks
- `src/pocketbase.d.ts` — Generated PocketBase types
- `vite.config.ts` — Vite configuration with plugins
- `svelte.config.js` — Uses `@sveltejs/adapter-node`
- `pb_migrations/` — PocketBase schema migrations
- `pb_hooks/` — PocketBase server-side hooks (Go/JavaScript)

**Testing Setup:**
- Vitest with two test projects:
  - `client` — Browser tests for Svelte components (`.svelte.{test,spec}.{js,ts}`)
  - `server` — Node tests for server code (`.{test,spec}.{js,ts}`)
- Playwright for E2E tests in `e2e/`

**Internationalization:**
- Paraglide for i18n, configured with `project.inlang/`
- Messages in `messages/` directory

### PocketBase Integration Pattern

The template uses PocketBase without an API proxy. Client-side code can directly instantiate PocketBase:

```typescript
import PocketBase from 'pocketbase';
const pb = new PocketBase('http://127.0.0.1:8090');
```

Auth state is managed through cookies and synchronized in `src/hooks.server.ts`.

### CLI Scaffolding Workflow

When the CLI creates a new project, it should:

1. Check/install PocketBase binary (platform-aware)
2. Prompt for project name
3. Copy `template/` directory to target location
4. Run `pnpm install` in the new project
5. Initialize git repository
6. Initialize PocketBase (`pocketbase serve` to create `pb_data/`)
7. Create PocketBase admin user
8. Display success message with next steps

## Code Quality Standards

**Linting & Formatting:**
- Use `oxlint` (Rust-based linter) and `oxfmt` (Rust-based formatter)
- Configuration in `.oxlintrc.json` and `.oxfmtrc.json`
- Always run `pnpm lint:fix` before committing

**TypeScript:**
- Strict mode enabled
- All code must be type-safe
- Use generated PocketBase types in template

**Testing:**
- Unit tests required for CLI utilities
- Component tests for Svelte components (browser mode)
- E2E tests for critical user flows

## Issue Tracking with Beads

**CRITICAL: Always use beads to track development work!**

This project uses **bd** (beads) for issue tracking. Claude Code should use beads for ALL development tasks.

### Beads Commands Reference

```bash
# Basic Operations
bd status                # Overview of all issues
bd list                  # List all issues
bd new "Description"     # Create new issue
bd show <id>             # View issue details
bd work <id>             # Start working on issue (sets status to in_progress)
bd done <id>             # Mark issue as complete
bd sync                  # Force sync with git

# Advanced Operations
bd ready                 # Find available work (not blocked)
bd update <id> --status <status>  # Manually update status
bd close <id> --reason "Description"  # Close with reason
```

### Beads Workflow for Claude Code

**MANDATORY: Follow this workflow for every task**

#### 1. Starting a New Task

When the user asks you to implement something:

```bash
# Check existing beads first
bd status
bd list

# Create a bead for the work
bd new "Implement user authentication with PocketBase"
# Note the returned ID (e.g., bd-1)

# Start working
bd work bd-1
```

#### 2. During Development

- Keep the bead ID in mind as you work
- Break large tasks into multiple beads if needed
- Use `bd show bd-1` to review the task description

#### 3. Completing Work

```bash
# Mark the bead as done
bd done bd-1

# Commit with bead reference
git add .
git commit -m "feat: add user authentication (bd-1)"

# Push changes
git push

# Sync beads with git
bd sync
```

### When to Create Beads

Create beads for:
- ✅ **New features** - "Add 2FA support"
- ✅ **Bug fixes** - "Fix OTP verification flow"
- ✅ **Refactoring** - "Simplify auth state management"
- ✅ **Tests** - "Add E2E tests for auth flows"
- ✅ **Documentation** - "Update API documentation"
- ✅ **Performance** - "Optimize database queries"

Do NOT create beads for:
- ❌ Reading/exploring code
- ❌ Answering questions
- ❌ Planning (use plan mode instead)

### Beads Best Practices

1. **One Bead Per Logical Unit**: Each bead represents a single, cohesive piece of work
2. **Descriptive Titles**: Use clear, actionable descriptions
   - ✅ Good: "Fix 2FA email field removal"
   - ❌ Bad: "Fix stuff"
3. **Work Status Updates**: Always use `bd work` and `bd done` to update status
4. **Reference in Commits**: Include bead ID in commit messages: `(bd-XXX)`
5. **Complete Before New Work**: Finish and close current bead before starting new work

### Example Workflow

```bash
# User says: "The 2FA flow is broken"

# 1. Create bead
bd new "Fix 2FA OTP verification flow"
# Returns: Created issue bd-1

# 2. Start working
bd work bd-1

# 3. Make changes to fix the issue
# ... edit files ...

# 4. Complete the bead
bd done bd-1

# 5. Commit with reference
git add .
git commit -m "fix: correct 2FA state management (bd-1)

- Remove unnecessary email field
- Fix OTP form visibility
- Update state handling in Svelte component"

# 6. Push and sync
git push
bd sync
```

### Beads Status Values

- `open` - New, not started
- `in_progress` - Currently being worked on
- `blocked` - Cannot proceed (dependency or issue)
- `closed` - Completed
- `ready` - Open and unblocked, ready to start

### Critical: Session Completion ("Landing the Plane")

Work is NOT complete until `git push` succeeds. Always:
1. Mark bead as done: `bd done <id>`
2. Run quality gates if code changed: `pnpm run check`
3. Commit with bead reference
4. Push: `git pull --rebase && git push`
5. Sync beads: `bd sync`
6. Verify: `git status` shows "up to date with origin"

## Common Patterns

**CLI Implementation:**
- Use `consola` for all logging (info, success, error, warn)
- Use `execa` for shell command execution
- Use `prompts` for user input
- Use `ora` for progress spinners

**Template Development:**
- Build features in `template/src/`, not in generated projects
- Use shadcn-svelte for UI components
- Use `radashi` for utility functions (modern Lodash alternative)
- Use Zod with `sveltekit-superforms` for form validation
- Import SVGs as components: `import Logo from '$lib/assets/logo.svg?component'`

**SvelteKit Patterns:**
- Server-only code in `src/lib/server/`
- Load functions in `+page.server.ts` for SSR data fetching
- Form actions in `+page.server.ts` for mutations
- Use `$app/stores` for client-side reactive stores

## Build & Native Dependencies

The root `package.json` and template `package.json` both specify native dependencies that must be built:

```json
{
  "pnpm": {
    "onlyBuiltDependencies": [
      "@tailwindcss/oxide",
      "esbuild",
      "sqlite3"
    ]
  }
}
```

This ensures pnpm only rebuilds these specific native modules.

## Versioning & Commits

- Follow **Conventional Commits**: `feat:`, `fix:`, `chore:`, `docs:`
- Follow **Semantic Versioning**
- Include beads issue ID in commits: `(bd-XXX)`

## Node.js Version

Both CLI and template require Node.js 20.x (specified in `.nvmrc` and `engines` field).

## Key Dependencies Summary

**CLI:**
- `tsx` — TypeScript execution
- `tsup` — Build tool
- `execa` — Process execution
- `consola` — Logging
- `ora` — Spinners
- `prompts` — User input
- `oxlint/oxfmt` — Linting/formatting

**Template:**
- `@sveltejs/kit` — Framework
- `pocketbase` — Backend client
- `tailwindcss` — CSS framework
- `bits-ui` — Headless component primitives (used by shadcn-svelte)
- `zod` — Schema validation
- `sveltekit-superforms` — Form handling
- `radashi` — Utility library
- `@poppanator/sveltekit-svg` — SVG component support
- `@inlang/paraglide-js` — i18n
- `vitest` — Testing
- `playwright` — E2E testing
