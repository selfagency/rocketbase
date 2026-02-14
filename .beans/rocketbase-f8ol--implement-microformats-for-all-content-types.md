---
# rocketbase-f8ol
title: Implement microformats for all content types
status: completed
type: feature
priority: high
created_at: 2026-02-13T22:51:48Z
updated_at: 2026-02-14T06:05:21Z
---

Add microformats support for all content types following IndieWeb standards. See: https://indieweb.org/microformats


## Summary of Changes
- Implemented microformats (mf2) across all primary content types.
- **Posts**: Added `h-entry` markup to single post pages and preview cards. Included `p-name`, `e-content`, `dt-published`, `u-url`, and `p-category`.
- **Authors**: Added `h-card` support to author profiles and post footers. Included `p-name`, `u-photo`, `u-note`, and `u-url` with `rel="me"` for verified website links.
- **Pages**: Wrapped CMS-generated content in `h-entry`.
- **Feeds**: Added `h-feed` to post listings for better syndication support.
