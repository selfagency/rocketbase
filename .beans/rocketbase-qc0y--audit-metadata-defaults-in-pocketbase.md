---
# rocketbase-qc0y
title: Audit metadata defaults in PocketBase
status: completed
type: task
priority: normal
created_at: 2026-02-15T16:39:24Z
updated_at: 2026-02-15T16:47:42Z
---

Review metadata collection via PocketBase MCP and ensure existing fields have default values applied for current records.

## Summary of Changes

- Expanded `db/pb_hooks/12-metadata-defaults.pb.js` to include missing metadata defaults found in the current collection set.
- Added defaults for keys: `fediverse_username`, `admin_posts_per_page`, `posts_per_page`, `revisions_kept`, `comments_enabled`, `custom_css`, `js_tags`.
- Kept compatibility key `fediverse_handle` and updated labels for `og_image`, `bluesky_handle`, `cdn_url` to match current naming conventions.
- Kept behavior safe: defaults are only applied when records/fields are missing or null; existing non-empty values are preserved.
- Verified hook syntax and diagnostics locally.
