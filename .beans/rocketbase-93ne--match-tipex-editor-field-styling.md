---
# rocketbase-93ne
title: Match Tipex editor field styling
status: completed
type: task
priority: normal
created_at: 2026-02-15T05:07:57Z
updated_at: 2026-02-15T05:13:44Z
---

Make the Tipex editor container and focus states visually consistent with other admin form inputs (Input/Textarea) while preserving accessibility and toolbar behavior.

## Summary of Changes

- Updated app/src/lib/components/ui/tipex-editor.svelte so the editor shell uses the same border, background, shadow, focus ring, and invalid-state tokens as standard form controls.
- Added class merging support for TipexEditor wrapper to keep it consistent with other UI inputs.
- Tuned Tipex internal container/controller styles to remove the standalone glossy theme and match existing form chrome.
- Kept accessible focus indication and media button focus visibility intact.

Validation:
- pnpm check (app) passed with 0 errors and 0 warnings.

Follow-up: set Tipex editor wrapper light-mode background to exact oklch(0.985 0 0) via bg-[oklch(0.985_0_0)] in app/src/lib/components/ui/tipex-editor.svelte (thin toolbar separator remains in place). Validation: pnpm check (app) passed with 0 errors and 0 warnings.

Follow-up: made toolbar divider thinner (0.5px pseudo-line) and doubled editor minimum height in app/src/lib/components/ui/tipex-editor.svelte (editor section 170->340, ProseMirror 130->260). Validation: pnpm check (app) passed with 0 errors and 0 warnings.
