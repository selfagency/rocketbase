---
# rocketbase-c4tk
title: Add person-tag support
status: completed
type: feature
priority: high
created_at: 2026-02-13T22:51:52Z
updated_at: 2026-02-15T08:20:05Z
parent: rocketbase-inji
---

Implement person-tagging functionality. See: https://indieweb.org/person-tag

## Summary of Changes\n\n- Implemented IndieWeb person-tagging using `u-category` and `h-card` classes on author links.\n- Added 👤 (person silhouette) icon to author links and profiles to indicate person tags per standard UX conventions (indieweb.org/person-tag).\n- Improved markup in `PostHeader`, `PostCard`, `AuthorDetail`, and the author directory page for full microformat compliance.\n- Verified site build and linting.

## Summary of Changes
- Integrated `lucide-svelte` and replaced 👤 emojis with `UsersIcon` and `UserIcon` across `PostCard`, `PostHeader`, and Author profiles.
- Resolved 13 `svelte-check` type errors:
    - Updated JSON and RSS feed servers to use flattened PocketBase properties (`post.author`, `post.tags`) instead of nested `expand`.
    - Corrected `MetaTags` prop usage in layout (fixed additionalMetaTags union type distribution) and login page (`as const` for Twitter cardType).
    - Replaced invalid `noindex`/`nofollow` props with `robots="noindex, nofollow"` in admin pages.
- Verified workspace with `svelte-check` (0 errors).
- Built with accessibility and professional iconography in mind.
