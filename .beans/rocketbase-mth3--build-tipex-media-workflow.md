---
# rocketbase-mth3
title: Build Tipex media workflow
status: in-progress
type: feature
priority: normal
created_at: 2026-02-15T04:25:26Z
updated_at: 2026-02-15T08:16:58Z
parent: rocketbase-3h6u
---

Add WordPress-style media upload/selection/insertion workflow to Tipex using PocketBase media + attachments, with post/page scoped media, all-media browsing, and optional Pexels import with attribution.

## Progress Update (2026-02-14)

- Fixed SSR/runtime crash on  caused by unsupported  import usage in .
- Reworked editor integration to use a safe custom media button snippet via Tipex  slot.
- Added environment-gated Pexels behavior: editor/forms now pass  from server loads (), and the Pexels tab is hidden/disabled when unavailable.
- Media API now returns a graceful disabled payload for Pexels searches when key is missing.
- Validation: undefined
 ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL  Command "check" not found (app) passed with 0 errors/warnings.

## Progress Update (2026-02-14) — corrected

- Fixed SSR/runtime crash on /admin/posts/new caused by unsupported Controls import usage in tipex-editor.svelte.
- Reworked editor integration to use a safe custom media button snippet via Tipex foot slot.
- Added environment-gated Pexels behavior: editor/forms now pass pexelsEnabled from server loads (Boolean(PEXELS_API_KEY)), and the Pexels tab is hidden when unavailable.
- Media API now returns a graceful disabled payload for Pexels searches when key is missing.
- Validation: pnpm check (app) passed with 0 errors/warnings.

## Progress Update (2026-02-15) — editor polish + snapshots\n\n- Made the Tipex editor visually cleaner by removing duplicate border treatment and relying on a single outer border.\n- Made the editor content area vertically resizable for easier long-form editing.\n- Moved the media trigger out of its own bottom row into a compact in-editor button so it no longer sits on a separate line.\n- Updated Pexels branding to use the SVG component-loader path () and added the plugin-provided SVG type declarations in .\n- Implemented Superforms snapshot support for all admin add/edit post/page forms by exposing capture/restore from the form components and wiring route-level  exports in:\n  - \n  - \n  - \n  - \n- Validation: 
> rocketbase-app@0.1.0 check /Users/daniel/Developer/rocketbase/app
> svelte-kit sync && svelte-check --tsconfig ./tsconfig.json

Loading svelte-check in workspace: /Users/daniel/Developer/rocketbase/app
Getting Svelte diagnostics...

svelte-check found 0 errors and 0 warnings passed with 0 errors/warnings.

## Progress Update 2026-02-15 clean

- Editor: removed double-border styling and made content area vertically resizable.
- Editor: moved media trigger to compact in-editor button (no separate bottom line).
- Pexels logo now loaded as SVG component using ?component import.
- Added SVG query typings by importing @poppanator/sveltekit-svg/dist/svg.d.ts in app/src/app.d.ts.
- Added Superforms snapshot capture/restore for admin post/page create and edit routes.
- Validation: cd app && pnpm check passed with 0 errors and 0 warnings.

## Progress Update (2026-02-15) — toolbar separator tweak

- Added a subtle separator above the editor toolbar in app/src/lib/components/ui/tipex-editor.svelte.
- Applied the separator to multiple toolbar selectors (tipex-controller, tipex-controls, tipex-toolbar) to ensure it renders regardless of internal class choice.
- Validation: diagnostics report no issues for tipex-editor.svelte.

## Progress Update (2026-02-15) — controls/raw-html/media-feedback/curated-prefetch

- Removed default utility controls (copy text + edit link) from Tipex UI by hiding the utilities section in app/src/lib/components/ui/tipex-editor.svelte.
- Added a raw HTML edit flow in Tipex editor with an HTML button, modal source editor, and apply action using editor.commands.setContent(..., true).
- Added explicit success/error feedback messaging for managed media operations in app/src/lib/components/ui/tipex-media-modal.svelte, including in Manage mode.
- Implemented curated Pexels fallback/prefetch: app/src/routes/api/admin/media/+server.ts now returns curated photos when q is empty; modal preloads curated photos on open.
- Explicitly skipped image-resize implementation per request.

Validation:
- pnpm check (app) passed with 0 errors and 0 warnings.

\n## Progress Update (2026-02-15) — CodeJar modal lifecycle fix\n\n- Fixed CodeJar HTML editor lifecycle in app/src/lib/components/ui/tipex-editor.svelte so it initializes per modal open and is destroyed on close (prevents stale detached-instance behavior where editor appears not to load).\n- Added error surfacing if CodeJar dynamic import/init fails.\n\nValidation:\n- pnpm check (app) passed with 0 errors and 0 warnings.

\n## Progress Update (2026-02-15) — CodeJar highlighting + line numbers\n\n- Replaced the placeholder CodeJar highlighter with HTML token highlighting (tags, attributes, values, comments, punctuation) in app/src/lib/components/ui/tipex-editor.svelte.\n- Added a line-number gutter via CSS counters so the raw HTML editor now shows numbered lines.\n- Kept the existing dynamic browser-only CodeJar loading and modal lifecycle cleanup.\n\nValidation:\n- pnpm check (app) passed with 0 errors and 0 warnings.

## Progress Update (2026-02-15) — Tipex/Superforms snapshot sync fix

- Fixed content sync in app/src/lib/components/ui/tipex-editor.svelte by subscribing to editor update/blur events and writing every HTML change into the bound value field used by Superforms snapshots.
- Added reverse reconciliation so external value updates (like snapshot restore) are pushed back into the Tipex editor via setContent(..., true).
- Normalized empty-editor HTML (<p></p>) to empty string in both directions to prevent stale mismatch.

Validation:
- pnpm check (app) passed with 0 errors and 0 warnings.

## Progress Update (2026-02-15) — snapshot recovery on create routes

- Identified root cause for “snapshot still not working”: EditorSessionGuard was wired on edit routes only, not on create routes.
- Added EditorSessionGuard to:
  - app/src/routes/admin/posts/new/+page.svelte
  - app/src/routes/admin/pages/new/+page.svelte
- Added restoreDraft handlers and getSnapshot wiring for both routes so autosave + recovery run while creating new entries.
- Used per-user draft record ids (`new-<userId>`) to isolate draft snapshots.

Validation:
- pnpm check (app) passed with 0 errors and 0 warnings.

## Progress Update (2026-02-15) — snapshot content persistence hardening

- Hardened autosave serialization in app/src/lib/components/admin/editor-session-guard.svelte:
  - Added safe serializer that handles circular structures, Date, File, and Blob values.
  - Autosave now hashes and posts a guaranteed-serializable snapshot payload.
- Updated form snapshot helpers to explicitly preserve rich content field:
  - app/src/lib/components/admin/posts/post-form.svelte
  - app/src/lib/components/admin/pages/page-form.svelte
  - captureFormSnapshot now stores `{ superform, content }`.
  - restoreFormSnapshot now restores both superform state and explicit content value.

Validation:
- pnpm check (app) passed with 0 errors and 0 warnings.

Summary: Create-route snapshots now use stable form IDs (admin-post-create/admin-page-create) instead of user IDs; stable Superforms IDs added for post/page forms; recovery warning now only shows when saved snapshot differs from initial baseline; warning alert buttons restyled to amber theme; pnpm check in app passed with 0 errors/warnings.
