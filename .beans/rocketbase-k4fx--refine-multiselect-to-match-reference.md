---
# rocketbase-k4fx
title: Refine MultiSelect to match reference
status: completed
type: task
priority: normal
created_at: 2026-02-15T02:36:52Z
updated_at: 2026-02-15T02:54:13Z
---

Adjust multi-select UX/behavior to closely match provided reference component; improve chips-in-trigger layout, controls, and interactions in post form.

## Progress Update

- Reworked `app/src/lib/components/ui/multi-select/multi-select.svelte` to use Bits UI `Combobox` primitives with reference-style control layout (chips + inline input + clear/chevron control section + inline dropdown).
- Fixed a compile blocker where `Combobox.Input` was incorrectly bound with `bind:value`; this prevented previous visual changes from taking effect.
- Added controlled clearing of input text via ref on value-change/close to match reference interaction flow.

Validation:
- `pnpm check` in `app/` passed with 0 errors and 0 warnings.

## Visual Parity Update

- Removed the nested/boxed appearance from the internal combobox input by forcing an unstyled inline input (`border-0`, `bg-transparent`, `p-0`, `ring-0`, `shadow-none`).
- Aligned control vertical rhythm (`min-h-10`, centered icon rail) so chips + placeholder render as a single unified control, matching the reference layout.

Validation:
- `pnpm check` in `app/` passed with 0 errors and 0 warnings.

## Styling Update

- Updated multi-select chip style to primary background with white text (`Badge variant="default"` + `text-white`).
- Updated faux-input container background to `oklch(0.985 0 0)` via `bg-[oklch(0.985_0_0)]`.

Validation:
- `pnpm check` in `app/` passed with 0 errors and 0 warnings.

- Follow-up: set selected-chip remove icon/button color to white (`text-white/90` + `hover:text-white`) so the badge “x” matches chip contrast.

## Summary of Changes

Finalized MultiSelect visual parity refinements in `app/src/lib/components/ui/multi-select/multi-select.svelte`:
- Kept selected chips on primary styling with white text.
- Set faux input/control background to `oklch(0.985 0 0)`.
- Updated selected-chip remove icon/button to white (`text-white/90` with `hover:text-white`) so the badge close control matches chip contrast.

Validation:
- `pnpm check` in `app/` passed with 0 errors and 0 warnings.
