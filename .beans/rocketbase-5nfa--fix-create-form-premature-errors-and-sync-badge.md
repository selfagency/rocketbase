---
# rocketbase-5nfa
title: Fix create-form premature errors and sync badge
status: completed
type: bug
priority: normal
created_at: 2026-02-15T06:33:14Z
updated_at: 2026-02-15T08:22:11Z
parent: rocketbase-90wn
---

Resolve initial validation errors showing before user input on new post/page forms and replace autosave status text with a right-aligned syncing badge on Create Page.

Follow-up fix: hardened Tipex attachments binding by removing bind fallback values in tipex-editor and tipex-media-modal, and normalizing attachments reads/writes so undefined never reaches bind targets. Also proxied editor attachments through always-array local state in post/page forms.

## Summary of Changes

- Suppressed premature validation errors on create post/page loaders so untouched forms do not show errors immediately.
- Added sync-state event handling and right-aligned syncing badge state wiring for create post/page screens.
- Stabilized snapshot capture/restore payloads to JSON-safe form data and normalized restored attachments/content values.
- Fixed editor/session sync behavior by using Tipex onupdate as primary source, normalizing reconcile checks, and adding a minimum visible sync duration so the spinner is perceptible.
- Removed attachment mirror effects that caused reactive update loops and bound attachments directly to form state.
