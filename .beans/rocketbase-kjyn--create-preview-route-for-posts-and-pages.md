---
# rocketbase-kjyn
title: Create preview route for posts and pages
status: completed
type: task
priority: normal
created_at: 2026-02-12T20:13:22Z
updated_at: 2026-02-15T08:34:32Z
parent: rocketbase-yu99
---

Imported from issues.jsonl (rocketbase-5w9). Owner: daniel@self.agency. Created by Daniel Sieradski 2026-02-11T00:42:35.668906-05:00.

## Summary of Changes

- Added secure preview routes for unpublished content:
  - `/preview/posts/[slug]` with role-based access (`admin`/`editor` can preview all, `contributor` only their own posts).
  - `/preview/pages/[id]` for `admin`/`editor` previews.
- Added preview banner text at the top of preview pages: "This is a preview of an unpublished draft."
- Added an "Open Preview" button to the page editor (`/admin/pages/[id]`) that opens the page preview in a new tab.
- Tightened public post route access so `/posts/[slug]` only loads `published = true && visible = true`.
- Added tests for preview authorization and updated existing post route tests accordingly.
