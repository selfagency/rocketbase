---
# rocketbase-l9yv
title: 'Refactor routes: extract complex code into components/modules'
status: in-progress
type: task
priority: high
created_at: 2026-02-13T22:51:45Z
updated_at: 2026-02-14T07:04:07Z
---

Go through routes and turn complex portions of code into their own components or external TypeScript files for better maintainability and testability.

## Progress
- Extracted shared account route schemas into `app/src/routes/account/schemas.ts` and updated both `account/+page.svelte` and `account/+page.server.ts` to import them.
- Extracted shared user display/avatar URL helpers into `app/src/lib/utils/user-profile.ts`.
- Updated `app/src/lib/components/global/Nav.svelte` and `app/src/routes/account/+page.svelte` to use the shared user-profile helpers instead of inline duplicated logic.
- Split `app/src/routes/account/+page.svelte` into route-local components:
  - `app/src/routes/account/components/ProfileCard.svelte`
  - `app/src/routes/account/components/MfaCard.svelte`
  - `app/src/routes/account/components/PasswordCard.svelte`
- Reduced `app/src/routes/account/+page.svelte` to form orchestration (superforms setup, snapshot, page-level toasts/meta) and component composition.
- Extracted `+layout.server.ts` navigation logic into `app/src/lib/routes/nav.ts`:
  - `buildHierarchy(...)`
  - `metadataListToObject(...)`
- Extracted fallthrough page constants/access checks into `app/src/lib/routes/page-fallthrough.ts` and updated `app/src/routes/[...slug]/+page.server.ts` to use them.
- Type-hardened `app/src/lib/routes/fallthrough.ts` by replacing `any` with `PageItem`-based helpers.
- Added focused unit tests in `app/src/tests/lib/routes/fallthrough.test.ts` for:
  - `findPageBySlug(...)`
  - `constructFullPath(...)`
- Consolidated reserved-fallthrough route constants/logic into `app/src/lib/routes/page-fallthrough.ts`:
  - `RESERVED_ROUTE_SEGMENTS`
  - `RESERVED_ROUTES`
  - `isReservedFallthroughSlug(...)`
- Updated `app/src/routes/[...slug]/+page.server.ts` and route tests to use the shared reserved-route helpers/constants.
- Added focused unit tests in `app/src/tests/lib/routes/page-fallthrough.test.ts`.
