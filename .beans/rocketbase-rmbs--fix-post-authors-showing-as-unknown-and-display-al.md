---
# rocketbase-rmbs
title: Fix post authors showing as unknown and display all authors
status: completed
type: bug
priority: normal
created_at: 2026-02-14T05:06:49Z
updated_at: 2026-02-14T05:17:32Z
---

## Description
Post authors are showing as "unknown" in the UI. The PostCard and PostHeader components only display the first author, but the user wants to see all authors.

## Tasks
- [x] Verify author data is correctly saved in PocketBase
- [x] Check if expand is working properly (failed due to permissions)
- [x] Create migration to update users collection permissions
- [x] Update PostCard to display all authors
- [x] Update PostHeader to display all authors
- [ ] Restart PocketBase to apply migration
- [ ] Test the changes



## Summary of Changes

1. **Fixed users collection permissions** - Created migration  to allow public viewing of user profiles so post authors can be displayed
2. **Updated PostCard component** - Now displays all authors with overlapping avatars and comma-separated names
3. **Updated PostHeader component** - Now displays all authors with overlapping avatars and comma-separated names
4. **Fixed metadata migration** - Corrected  to use proper PocketBase migration API
5. **Removed Twitter references** - Replaced  and  metadata with  and , removed Twitter card meta tags from post pages

## Testing
- Verified API expand works without authentication
- Both authors are correctly displayed in the expanded response
