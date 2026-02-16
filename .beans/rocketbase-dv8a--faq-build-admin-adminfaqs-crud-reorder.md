---
# rocketbase-dv8a
title: 'FAQ: build admin /admin/faqs CRUD + reorder'
status: completed
type: task
priority: critical
created_at: 2026-02-16T02:04:21Z
updated_at: 2026-02-16T02:36:29Z
parent: rocketbase-15d7
blocked_by:
    - rocketbase-creq
---

## Goal
Provide admin management for FAQ entries.

## Tasks
- [x] Add route(s) under `app/src/routes/admin/faqs`
- [x] Implement create/edit/delete actions with validation
- [x] Implement publish toggle and sort-order controls (up/down)
- [x] Ensure admin-only access enforcement and friendly unauthorized handling
- [x] Add success/error toasts and form feedback

## Acceptance Criteria
- Admin can create, update, delete, publish/unpublish, and reorder FAQs
- Non-admin users cannot perform admin FAQ actions
- Validation errors are clear and actionable

## Summary of Changes

Added `app/src/routes/admin/faqs/+page.server.ts` and `+page.svelte` implementing admin-only FAQ management with validation-backed create/update/delete actions, publish toggle, and up/down reordering. Added success toasts via query outcomes plus inline error feedback for validation/server failures, and updated admin navigation to include the FAQs route. Verified with `pnpm -C app run check` (0 errors, 1 pre-existing warning).
