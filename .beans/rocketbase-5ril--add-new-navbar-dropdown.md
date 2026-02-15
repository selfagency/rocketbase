---
# rocketbase-5ril
title: Add New+ navbar dropdown
status: completed
type: feature
priority: normal
created_at: 2026-02-15T03:44:33Z
updated_at: 2026-02-15T03:48:06Z
---

Add a New + dropdown button to the nav, positioned left of the account dropdown, with Page and Post links.

- Updated role gating: New button now appears for admin/editor/contributor; Page option is visible only to admin/editor; Post remains available in New menu.

- Restyled New dropdown: primary background with primary-foreground text/icon; softened dropdown border by using border-border/60 and shadow-md.

- Softened account dropdown panel border by applying border-border/60 and shadow-md to avoid a hard black border.

## Summary of Changes

- Added a new `New` dropdown button in the navbar, positioned to the left of the account dropdown.
- Used Lucide `circle-plus` icon in the `New` trigger.
- Added menu actions:
  - `Page` → `/admin/pages/new` (admin/editor only)
  - `Post` → `/admin/posts/new` (admin/editor/contributor)
- Applied role visibility rules:
  - New button visible for admin, editor, contributor
  - Page item visible only for admin/editor
- Updated styling:
  - New button uses primary background with primary-foreground text/icon
  - New dropdown and account dropdown both use softened panel borders (`border-border/60`) and `shadow-md`

Validation:
- `pnpm check` in `app/` passed with 0 errors and 0 warnings.
