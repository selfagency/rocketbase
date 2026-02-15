---
# rocketbase-julm
title: Fix form snapshot support to use Superforms API
status: completed
type: task
priority: high
created_at: 2026-02-12T20:13:22Z
updated_at: 2026-02-15T08:20:36Z
parent: rocketbase-90wn
---

Imported from issues.jsonl (rocketbase-xfj). Closed in file (updated forms to use Superforms capture/restore). Owner: daniel@self.agency. Created by Daniel Sieradski 2026-02-10T00:19:13.597676-05:00.

## Summary of Changes

Added Superforms snapshot support (using capture/restore API) to preserve form state during browser navigation:

1. **Login page** ([src/routes/login/+page.svelte:37-40](src/routes/login/+page.svelte#L37-L40))
   - Added `capture` and `restore` to superForm destructuring
   - Exported snapshot: `export const snapshot = { capture, restore }`

2. **Account page** ([src/routes/account/+page.svelte:76-82,136-138](src/routes/account/+page.svelte#L76-L82))
   - Added snapshot support for profile form only
   - Password and 2FA forms intentionally excluded (sensitive data shouldn't be preserved)
   - Used Superforms API pattern: destructure capture/restore, then export snapshot

This follows the same pattern already implemented in:
- Register page ([src/routes/register/+page.svelte:38-41](src/routes/register/+page.svelte#L38-L41))
- Forgot password page ([src/routes/forgot-password/+page.svelte:39-42](src/routes/forgot-password/+page.svelte#L39-L42))

All forms now have consistent snapshot support using the Superforms API.
