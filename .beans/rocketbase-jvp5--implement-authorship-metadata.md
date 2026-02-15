---
# rocketbase-jvp5
title: Implement authorship metadata
status: completed
type: feature
priority: high
created_at: 2026-02-13T22:51:51Z
updated_at: 2026-02-15T08:20:11Z
parent: rocketbase-inji
---

Add authorship metadata following https://authorship.rocks/ standards.


## Summary of Changes
- Implemented authorship metadata following IndieWeb standards and authorship.rocks guidelines.
- Added `rel="author"` to all author links in `PostHeader` and `PostCard`.
- Ensured authors are represented as `p-author h-card` with nested `p-name` and `u-url`.
- Verified that the `u-url` of the embedded `h-card` matches the link to the full author profile.
