# Codebase Refactoring & Test Coverage Epic

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Systematically break up complex files into smaller, testable units, then achieve comprehensive test coverage across `app/src/`.

**Architecture:** Refactor-then-test approach in 5 phases. Extract pure utilities first (easiest wins), then server services, then deduplicate admin forms, then split large components, and finally sweep remaining test gaps. Each phase is independently valuable and shippable.

**Tech Stack:** SvelteKit 2.x, Svelte 5, TypeScript, Vitest (node + browser), vitest-browser-svelte, Playwright, Zod 4, sveltekit-superforms, PocketBase

**Scope exclusions:** Skip all shadcn-svelte UI components (`lib/components/ui/` except tipex-*). Skip generated files (`lib/paraglide/`, `lib/types/pocketbase.d.ts`).

---

## Test Configuration Reference

- **Node tests** (`pnpm test:node`): `vitest.config.js` -- includes `src/tests/**/*.test.{js,ts}` and `src/tests/**/*.server.spec.{js,ts}`
- **Browser tests** (`pnpm test:browser`): `vitest.browser.config.js` -- includes `src/tests/**/*.svelte.spec.{js,ts}`, `src/tests/lib/utils/**/*.test.ts`, `src/tests/lib/schemas/**/*.test.ts`, `src/tests/lib/stores/**/*.test.ts`, `src/lib/components/**/*.spec.{js,ts}`
- **E2E** (`pnpm test:e2e`): Playwright -- `src/tests/e2e/`

Convention: Pure utility tests go in `src/tests/lib/utils/` as `.test.ts`. Server tests go in `src/tests/` as `.server.spec.ts`. Component tests go alongside components as `.spec.ts` or in `src/tests/` as `.svelte.spec.ts`.

---

## Phase 1: Extract Pure Utilities

**Bean type:** task | **Estimated tasks:** 12 | **Dependencies:** None

Extract pure JavaScript/TypeScript functions from large component files. These have zero framework dependencies and are trivially testable.

### Task 1.1: Extract HTML syntax highlighter from tipex-editor

**Files:**
- Create: `app/src/lib/utils/html-highlighter.ts`
- Create: `app/src/tests/lib/utils/html-highlighter.test.ts`
- Modify: `app/src/lib/components/ui/tipex-editor.svelte`

**What to extract:** Lines 116-196 of `tipex-editor.svelte` contain three pure functions: `escapeCode()`, `highlightTag()`, `highlightHtmlCode()`. These do regex-based HTML syntax highlighting for the CodeJar editor. They have zero imports and zero framework dependencies.

**Step 1:** Create `html-highlighter.ts` with the three exported functions (copy lines 116-196 verbatim, add proper TS exports)

**Step 2:** Write failing tests in `html-highlighter.test.ts`:
- `escapeCode` handles `<>&"'` characters
- `highlightTag` handles opening, closing, self-closing tags, tags with attributes
- `highlightHtmlCode` handles mixed HTML with tags + text + comments
- Edge cases: empty string, malformed tags, nested attributes

**Step 3:** Run `pnpm test:browser -- html-highlighter` -- verify tests pass

**Step 4:** Update `tipex-editor.svelte` -- replace function definitions with `import { escapeCode, highlightTag, highlightHtmlCode } from '$lib/utils/html-highlighter'`

**Step 5:** Verify app still works (CodeJar highlighting functional)

**Step 6:** Commit: `refactor: extract HTML highlighter utils from tipex-editor`

---

### Task 1.2: Extract attribution builder from tipex-editor

**Files:**
- Create: `app/src/lib/utils/media-attribution.ts`
- Create: `app/src/tests/lib/utils/media-attribution.test.ts`
- Modify: `app/src/lib/components/ui/tipex-editor.svelte`

**What to extract:** Lines 63-103 of `tipex-editor.svelte`: `escapeHtml()`, `buildAttribution()`, and the figure HTML building logic inside `insertSelectedMedia()`. Pure string manipulation with no framework deps.

**Step 1:** Create `media-attribution.ts` with exports:
- `escapeHtml(input: string): string` (lines 63-70)
- `buildAttribution(media: { source?: string; sourceUrl?: string; attribution?: { photographer?: string; photographerUrl?: string; photoUrl?: string } }): string` (lines 72-88)
- `buildFigureHtml(imageUrl: string, altText: string, caption: string, attribution: string): string` (extracted from lines 90-103)

**Step 2:** Write failing tests:
- `escapeHtml` with special characters
- `buildAttribution` for Pexels source with full metadata, missing photographerUrl, missing photoUrl, non-Pexels source (returns '')
- `buildFigureHtml` with caption, without caption, with attribution, with both

**Step 3:** Run tests -- verify pass

**Step 4:** Update `tipex-editor.svelte` -- import from `$lib/utils/media-attribution`, remove definitions, refactor `insertSelectedMedia` to use `buildFigureHtml`

**Step 5:** Commit: `refactor: extract media attribution and figure HTML utils`

---

### Task 1.3: Extract snapshot serializer from editor-session-guard

**Files:**
- Create: `app/src/lib/utils/snapshot-serializer.ts`
- Create: `app/src/tests/lib/utils/snapshot-serializer.test.ts`
- Modify: `app/src/lib/components/admin/editor-session-guard.svelte`

**What to extract:** Lines 60-95 of `editor-session-guard.svelte`: `serializeSnapshot()` -- JSON serialization with File/Blob handling and circular reference detection. Pure function.

**Step 1:** Create `snapshot-serializer.ts` exporting `serializeSnapshot(snapshot: unknown): string`

**Step 2:** Write failing tests:
- Serializes plain objects
- Converts Date to ISO string
- Handles File instances (produces `{__type: 'file', name, size, type, lastModified}`)
- Handles Blob instances (produces `{__type: 'blob', size, type}`)
- Detects circular references (produces `'[Circular]'`)
- Handles nested objects and arrays

**Step 3:** Run tests -- verify pass

**Step 4:** Update `editor-session-guard.svelte` -- import from `$lib/utils/snapshot-serializer`, remove local definition

**Step 5:** Check if `page-form.svelte` and `post-form.svelte` have duplicate `sanitizeSnapshotValue()` functions. If so, replace with the extracted utility too.

**Step 6:** Commit: `refactor: extract snapshot serializer, dedupe across forms`

---

### Task 1.4: Test existing utility -- relative-time.ts

**Files:**
- Create: `app/src/tests/lib/utils/relative-time.test.ts`
- Source: `app/src/lib/utils/relative-time.ts` (49 lines, pure function)

**Step 1:** Write tests for `formatRelativeTime()`:
- `null`/`undefined` returns `'-'`
- Invalid date string returns `'-'`
- Few seconds ago
- Minutes ago (singular and plural)
- Hours ago
- Days ago
- Months ago
- Years ago
- Future dates (`in X minutes`, etc.)

**Step 2:** Run `pnpm test:browser -- relative-time` -- verify pass

**Step 3:** Commit: `test: add coverage for relative-time utility`

---

### Task 1.5: Test existing utility -- slug-utils.ts

**Files:**
- Create: `app/src/tests/lib/utils/slug-utils.test.ts`
- Source: `app/src/lib/utils/slug-utils.ts` (36 lines, uses `radashi.dash` and `stopword`)

**Step 1:** Write tests for `generateSlug()`:
- Normal title: `"Hello World"` -> hyphenated lowercase without stopwords
- Special characters: `"cafe resume"` with accents
- All stopwords: keeps original words
- Empty string returns `''`
- Mixed case and punctuation

**Step 2:** Run tests -- verify pass

**Step 3:** Commit: `test: add coverage for slug-utils`

---

### Task 1.6: Test existing utility -- image-sizes.ts

**Files:**
- Create: `app/src/tests/lib/utils/image-sizes.test.ts`
- Source: `app/src/lib/utils/image-sizes.ts` (47 lines, pure functions + constants)

**Step 1:** Write tests for:
- `appendThumb()`: with thumb, without thumb (null), URL with existing query params
- `getStandardImageUrl()`: each size key (sm, md, lg, xl, full)
- `getSocialImageUrl()`: each network key (facebook, twitter, linkedin, instagram)
- Verify `STANDARD_IMAGE_SIZE_PRESETS` and `SOCIAL_IMAGE_PRESETS` arrays have correct entries

**Step 2:** Run tests -- verify pass

**Step 3:** Commit: `test: add coverage for image-sizes utility`

---

### Task 1.7: Test existing schemas -- page.ts and post.ts

**Files:**
- Create: `app/src/tests/lib/schemas/page.test.ts`
- Create: `app/src/tests/lib/schemas/post.test.ts`
- Source: `app/src/lib/schemas/page.ts` (26 lines), `app/src/lib/schemas/post.ts` (27 lines)

**Step 1:** Write tests for `pageSchema`:
- Valid page data passes
- Missing title fails
- Invalid slug (uppercase, spaces, special chars) fails
- Slug regex: only `[a-z0-9-]+` allowed
- Default values: `published: false`, `visible: true`, etc.

**Step 2:** Write tests for `postSchema`:
- Valid post data passes
- Missing title/slug/date fails
- Empty author array fails (min 1 required)
- Default values work

**Step 3:** Run `pnpm test:browser -- schemas` -- verify pass

**Step 4:** Commit: `test: add coverage for page and post schemas`

---

## Phase 2: Extract Server Services

**Bean type:** task | **Estimated tasks:** 10 | **Dependencies:** Phase 1

Extract server-side business logic from large route files into testable service modules. Test with mocked PocketBase clients.

### Task 2.1: Extract profile service from account/+page.server.ts

**Files:**
- Create: `app/src/lib/server/services/profile-service.ts`
- Create: `app/src/tests/server/services/profile-service.server.spec.ts`
- Modify: `app/src/routes/account/+page.server.ts` (378 lines, 7 actions)

**What to extract:** The `updateProfile` action's PocketBase interaction logic. Keep superforms validation in the action, extract the `pb.collection('users').update()` call and avatar handling into a service function.

**Step 1:** Read `account/+page.server.ts` fully to identify extraction boundary

**Step 2:** Create `profile-service.ts` with `updateUserProfile(pb, userId, data, avatarFile?)`

**Step 3:** Write failing server tests (mock PocketBase with vi.fn())

**Step 4:** Make tests pass

**Step 5:** Update route to use service

**Step 6:** Commit: `refactor: extract profile update service from account actions`

---

### Task 2.2: Extract MFA service from account/+page.server.ts

**Files:**
- Create: `app/src/lib/server/services/mfa-service.ts`
- Create: `app/src/tests/server/services/mfa-service.server.spec.ts`
- Modify: `app/src/routes/account/+page.server.ts`

**What to extract:** MFA-related actions (enableMfa, disableMfa, setupMfa, completeMfaSetup). These interact with PocketBase's MFA/OTP collections.

Same TDD pattern: create service -> write failing tests -> make pass -> update route -> commit.

**Commit:** `refactor: extract MFA service from account actions`

---

### Task 2.3: Extract Pexels service from api/admin/media/+server.ts

**Files:**
- Create: `app/src/lib/server/services/pexels-service.ts`
- Create: `app/src/tests/server/services/pexels-service.server.spec.ts`
- Modify: `app/src/routes/api/admin/media/+server.ts` (359 lines)

**What to extract:** Pexels image download + import logic from the POST handler. Create `downloadPexelsImage(url)` and `importPexelsMedia(pb, imageBuffer, metadata)`.

Same TDD pattern.

**Commit:** `refactor: extract Pexels download service from media API`

---

### Task 2.4: Extract media repository from api/admin/media/+server.ts

**Files:**
- Create: `app/src/lib/server/repositories/media-repository.ts`
- Create: `app/src/tests/server/repositories/media-repository.server.spec.ts`
- Modify: `app/src/routes/api/admin/media/+server.ts`

**What to extract:** Media record mapping, attachment resolution, and query building from GET handler.

Same TDD pattern.

**Commit:** `refactor: extract media repository from media API`

---

### Task 2.5: Extract content snapshot mappers

**Files:**
- Create: `app/src/lib/server/mappers/content-mapper.ts`
- Create: `app/src/tests/server/mappers/content-mapper.server.spec.ts`
- Modify: `app/src/routes/admin/posts/[id]/+page.server.ts` (304 lines)
- Modify: `app/src/routes/admin/pages/[id]/+page.server.ts` (293 lines)

**What to extract:** Both admin edit routes have snapshot-to-update-payload mapping logic (handling arrays, File exclusion, relation flattening). Extract shared `mapSnapshotToContentUpdate()` with entity-specific wrappers.

Same TDD pattern.

**Commit:** `refactor: extract and consolidate content snapshot mappers`

---

### Task 2.6: Test existing server file -- page-size-store.ts

**Files:**
- Create: `app/src/tests/server/page-size-store.server.spec.ts`
- Source: `app/src/lib/server/page-size-store.ts`

Write server tests with mocked PocketBase. Test page size retrieval, caching, cookie handling.

**Commit:** `test: add coverage for page-size-store`

---

### Task 2.7: Test existing server file -- redirect-handler.ts & redirect-store.ts

**Files:**
- Create: `app/src/tests/server/redirect-handler.server.spec.ts`
- Create: `app/src/tests/server/redirect-store.server.spec.ts`
- Source: `app/src/lib/server/redirect-handler.ts`, `app/src/lib/server/redirect-store.ts`

Write server tests for redirect loading, matching, and caching.

**Commit:** `test: add coverage for redirect handling`

---

### Task 2.8: Test existing server file -- revision-history.ts

**Files:**
- Create: `app/src/tests/server/revision-history.server.spec.ts`
- Source: `app/src/lib/server/revision-history.ts` (104 lines)

Test revision history fetching, filter building, author parsing, snapshot extraction.

**Commit:** `test: add coverage for revision-history service`

---

### Task 2.9: Test existing server file -- nav.ts

**Files:**
- Create: `app/src/tests/server/nav.server.spec.ts`
- Source: `app/src/lib/server/nav.ts`

Test navigation item loading and hierarchy building.

**Commit:** `test: add coverage for nav server utility`

---

## Phase 3: Deduplicate Admin Forms

**Bean type:** task | **Estimated tasks:** 6 | **Dependencies:** Phase 1 (snapshot-serializer)

Extract shared logic from `page-form.svelte` (420 lines) and `post-form.svelte` (416 lines) which share ~70% of their structure.

### Task 3.1: Extract shared form snapshot utilities

**Files:**
- Create: `app/src/lib/utils/admin/form-snapshot-utils.ts`
- Create: `app/src/tests/lib/utils/admin/form-snapshot-utils.test.ts`
- Modify: `app/src/lib/components/admin/pages/page-form.svelte`
- Modify: `app/src/lib/components/admin/posts/post-form.svelte`

Extract `captureSnapshot()`, `restoreSnapshot()`, `getDraftIdentity()` functions shared between both forms. These use the `serializeSnapshot` from Phase 1.3.

---

### Task 3.2: Create shared TitleSlugInput component

**Files:**
- Create: `app/src/lib/components/admin/shared/TitleSlugInput.svelte`
- Create: `app/src/lib/components/admin/shared/TitleSlugInput.spec.ts`
- Modify: both form files

Extract the title input + slug input + auto-generate slug button pattern duplicated in both forms.

---

### Task 3.3: Create shared PublishingToggles component

**Files:**
- Create: `app/src/lib/components/admin/shared/PublishingToggles.svelte`
- Create: `app/src/lib/components/admin/shared/PublishingToggles.spec.ts`
- Modify: both form files

Extract published, visible, require_login, subscriber_only toggle group.

---

### Task 3.4: Extract column visibility manager

**Files:**
- Create: `app/src/lib/utils/admin/column-visibility.ts`
- Create: `app/src/tests/lib/utils/admin/column-visibility.test.ts`
- Modify: `app/src/lib/components/admin/pages/data-table.svelte`
- Modify: `app/src/lib/components/admin/posts/data-table.svelte`

Extract localStorage-based column visibility persistence shared between both data tables.

---

### Task 3.5: Extract drag-drop controller

**Files:**
- Create: `app/src/lib/utils/admin/drag-drop-controller.ts`
- Create: `app/src/tests/lib/utils/admin/drag-drop-controller.test.ts`
- Modify: `app/src/lib/components/admin/pages/data-table.svelte`

Extract drag-drop state management and event handlers from the pages data table (80+ lines).

---

### Task 3.6: Test admin column definition files

**Files:**
- Create: `app/src/tests/lib/utils/admin/pages-columns.test.ts`
- Create: `app/src/tests/lib/utils/admin/posts-columns.test.ts`
- Source: `app/src/lib/utils/admin/pages-columns.ts` (121 lines), `app/src/lib/utils/admin/posts-columns.ts` (182 lines)

Test column helper functions and definitions.

---

## Phase 4: Split Large Components

**Bean type:** task | **Estimated tasks:** 4 | **Dependencies:** Phase 1, Phase 3

Break remaining large Svelte components into focused sub-components under 150 lines each.

### Task 4.1: Split tipex-media-modal.svelte (696 lines)

**Target sub-components:**
- `app/src/lib/components/admin/media/MediaUploadZone.svelte` (~80 lines) -- file input + progress
- `app/src/lib/components/admin/media/MediaGrid.svelte` (~60 lines) -- reusable grid display
- `app/src/lib/components/admin/media/PexelsSearch.svelte` (~90 lines) -- search form + results
- `app/src/lib/components/admin/media/MediaItemEditor.svelte` (~100 lines) -- edit alt/caption/delete

Keep `tipex-media-modal.svelte` as orchestrator with tabs and state (~350 lines). Write `.spec.ts` for each sub-component.

---

### Task 4.2: Split tipex-editor.svelte (590 lines after Phase 1 extractions -> ~400 lines)

**Target sub-components:**
- `app/src/lib/components/admin/editor/HtmlCodeEditor.svelte` (~120 lines) -- CodeJar wrapper dialog
- `app/src/lib/components/admin/editor/MediaInserter.svelte` (~60 lines) -- media modal trigger

Keep `tipex-editor.svelte` as main Tipex wrapper (~220 lines). Write `.spec.ts` for each.

---

### Task 4.3: Split editor-session-guard.svelte (409 lines after Phase 1 extraction -> ~350 lines)

**Target sub-components:**
- `app/src/lib/components/admin/editor/DraftRecovery.svelte` (~50 lines) -- recovery alert
- `app/src/lib/components/admin/editor/EditorWarnings.svelte` (~70 lines) -- active editors + record changed alerts

Keep `editor-session-guard.svelte` as orchestrator with worker/timer logic (~230 lines). Write `.spec.ts` for each.

---

### Task 4.4: Split revision-history-dialog.svelte (284 lines)

**Target sub-components:**
- `app/src/lib/components/admin/revisions/RevisionList.svelte` (~80 lines) -- timeline list
- `app/src/lib/components/admin/revisions/RevisionDiff.svelte` (~100 lines) -- field diff display

Keep `revision-history-dialog.svelte` as dialog wrapper (~100 lines). Write `.spec.ts` for each.

---

## Phase 5: Test Coverage Sweep

**Bean type:** task | **Estimated tasks:** 7 | **Dependencies:** Phases 1-4

Write tests for all remaining untested source files.

### Task 5.1: Test admin data table cell/action components

- `data-table-actions.svelte` (pages + posts)
- `page-title-cell.svelte`, `post-title-cell.svelte`
- `publish-visibility-cell.svelte` (pages + posts)
- `status-indicator.svelte`

### Task 5.2: Test post display components

- `PostCard.svelte`, `PostHeader.svelte`, `PostList.svelte`

### Task 5.3: Test account components

- `MfaCard.svelte`, `PasswordCard.svelte`

### Task 5.4: Test admin route server files

- `admin/pages/+page.server.ts` (list), `admin/pages/[id]/+page.server.ts` (edit)
- `admin/pages/new/+page.server.ts` (create), `admin/pages/reorder/+server.ts`
- `admin/posts/+page.server.ts` (list), `admin/posts/[id]/+page.server.ts` (edit)
- `admin/posts/new/+page.server.ts` (create)

### Task 5.5: Test API server files

- `api/admin/media/+server.ts` (after Phase 2 extractions, test remaining route logic)
- `api/admin/snapshots/+server.ts`

### Task 5.6: Test author routes and layout

- `authors/+page.server.ts`, `authors/[id]/+page.server.ts`
- `+layout.server.ts`

### Task 5.7: Run full test suite and coverage report

```bash
cd app && pnpm test:node -- --coverage
cd app && pnpm test:browser -- --coverage
```

Review `coverage/index.html`. Target >80% on `lib/` files (excluding `ui/`, `paraglide/`, `types/`).

---

## Verification

After each phase:
1. `cd app && pnpm lint` -- no new lint errors
2. `cd app && pnpm test:node` -- all node tests pass
3. `cd app && pnpm test:browser` -- all browser tests pass
4. `cd app && pnpm build` -- build succeeds
5. Manual smoke test: `cd app && pnpm dev` -- verify admin pages, editor, media modal still work

After Phase 5:
- Coverage report shows >80% on non-UI lib files
- All existing E2E tests still pass: `cd app && pnpm test:e2e`

---

## Beans Structure

Create one epic bean with 5 child task beans:

```
epic: "Codebase refactoring & test coverage"
  task: "Phase 1: Extract pure utilities"
  task: "Phase 2: Extract server services"
  task: "Phase 3: Deduplicate admin forms"
  task: "Phase 4: Split large components"
  task: "Phase 5: Test coverage sweep"
```

Each phase bean gets todo items matching its tasks above.
