# Rocketbase Copilot Summary (concise)

Package manager: `pnpm` (do not use npm or yarn)

## Purpose

Quick, Copilot-friendly reference for contributors and assistants. For full policies and detailed developer guidance see `CLAUDE.md` at the repository root.

## Repo at-a-glance

- `app/` — SvelteKit frontend (primary app)
- `db/` — PocketBase schema, migrations, hooks
- `sidecar/` — background services (queue, email, scheduled tasks)
- `cli/` — CLI tooling (future)
- `.beans/` — issue tracking (Beans)

## Essential rules

- Track all work with Beans (create/claim a bean before coding). Include the bean ID in commits.
- Follow Conventional Commits. Include bean IDs in commit messages when applicable.

## Common commands

```bash
# frontend dev
cd app && pnpm dev

# bring up dev services (docker)
pnpm --filter app dev:services

# run workspace tests
pnpm test

# lint & format
pnpm lint
pnpm format
```

## Quick workflow

1. Create/claim a bean: `beans create "…"` / `beans update <id>`
2. Implement in `app/`, `db/`, or `sidecar/`
3. Run checks: `pnpm lint && pnpm test && cd app && pnpm build`
4. Update the bean, run `beans prime`, commit (include bean id), push

## Required env examples

- `PUBLIC_POCKETBASE_URL="http://localhost:8090"`
- `API_KEY="<placeholder>"`
- `ZIPKIN_URL="http://localhost:9411/api/v2/spans"`
- `SERVICE_NAME="rocketbase-app"`

## Dev services (docker)

- `docker-compose.dev.yml`: mailpit, pocketbase (mounts `db/pb_*`), zipkin, otel collector
- `docker-compose.test.yml`: test services for CI; includes test pocketbase and the `app` service built from `app/Dockerfile`

## Key `app` scripts

- `pnpm dev` — start SvelteKit dev server
- `pnpm dev:services` — start supporting services via docker-compose
- `pnpm build` — build frontend
- `pnpm build:types` — generate PocketBase types
- `pnpm test` / `pnpm test:e2e` — run unit & e2e tests
- `pnpm lint` / `pnpm format` — lint and format

## Stack (short)

- Frontend: SvelteKit 2.x, Svelte 5, TypeScript, Vite
- Backend: PocketBase (SQLite), pocketbase-typegen
- UI: Tailwind, shadcn-svelte, Lucide icons
- Testing: Vitest, Playwright
- Observability: OpenTelemetry, Zipkin

## Security reminder

- Do NOT commit secrets. Use env vars or a secrets manager. Add `app/.env.example` with placeholders if needed.

## Tests & CI

- Use `pnpm test:setup` / `pnpm test:cleanup` helpers when present for integration tests.
- Playwright tests use role-based locators per repo guidelines.

## Where to look first

1. `CLAUDE.md` — authoritative developer instructions and policies
2. `app/` — primary implementation area (routes, components, tests)
3. `db/` — PocketBase hooks & migrations
4. `.beans/` — issue tracking and active tasks

## Quick contributing checklist

- Create/claim a bean
- Run lint & tests locally
- Include bean ID in commit message
- Push changes and update bean status
