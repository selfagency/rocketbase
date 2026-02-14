---
# rocketbase-74t3
title: Generate tags in blog post generator
status: completed
type: task
priority: normal
created_at: 2026-02-14T05:26:37Z
updated_at: 2026-02-14T05:32:57Z
---

Expand generate-posts.js to generate a dozen tags before generating posts.

## Summary of Changes
- Expanded  to automatically generate 12 random tags before creating posts.
- Updated  to associate 1-5 random tags with each post.
- Enhanced image handling to download and upload multiple images:
    - One image for the  field.
    - 0-3 additional images for the  field (multi-file field).
- Replaced custom  function with  from  for more robust string conversion.
- Verified that all changes work correctly by running the script from the app root.
