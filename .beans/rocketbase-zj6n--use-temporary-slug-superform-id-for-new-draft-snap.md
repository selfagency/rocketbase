---
# rocketbase-zj6n
title: Use temporary slug + superform id for new draft snapshot keys
status: completed
type: bug
priority: normal
created_at: 2026-02-15T06:19:50Z
updated_at: 2026-02-15T08:23:49Z
parent: rocketbase-90wn
---

Prevent collisions when multiple new post/page windows are open by using a temporary fake slug until title/slug exists and combining it with superform form.id in EditorSessionGuard recordId.

## Summary of Changes

- Updated new post/page draft record identity to include a per-tab unique UID.
- Draft snapshot record IDs now use slug + tab UID ( / ) to prevent collisions across multiple create windows.
- Wired draft identity updates from form slug/title changes so autosave/recovery remains scoped to the correct draft instance.
