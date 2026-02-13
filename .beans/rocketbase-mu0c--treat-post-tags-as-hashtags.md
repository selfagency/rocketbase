---
# rocketbase-mu0c
title: Treat post tags as hashtags
status: completed
type: feature
priority: high
created_at: 2026-02-13T22:51:49Z
updated_at: 2026-02-13T23:22:48Z
---

Implement hashtag functionality for post tags, making them clickable and searchable.

## Implementation

### Reusable Components Created

1. **PostCard.svelte** (`app/src/lib/components/global/PostCard.svelte`)
   - Displays post summary card with image, title, summary, author, date, and tags
   - Tags are clickable and link to `/tags/[slug]`
   - Tags display with `#` prefix as hashtags
   - Hover effects on tags for better UX

2. **PostList.svelte** (`app/src/lib/components/global/PostList.svelte`)
   - Grid layout for post cards
   - Pagination component integration
   - Empty state handling
   - Reusable across posts and tag pages

3. **PostHeader.svelte** (`app/src/lib/components/global/PostHeader.svelte`)
   - Post page header with title, summary, image, author, date, and tags
   - Tags are clickable hashtags
   - Consistent metadata display

### Routes Created

1. **Tags Index** (`app/src/routes/tags/`)
   - Lists all tags with post counts
   - Card-based layout with hover effects
   - Links to individual tag pages

2. **Individual Tag Page** (`app/src/routes/tags/[slug]/`)
   - Displays all posts for a specific tag
   - Reuses PostList component
   - Pagination support
   - Shows tag as a large badge/hashtag

### Updated Routes

1. **Posts Index** (`app/src/routes/posts/+page.svelte`)
   - Refactored to use PostList component
   - Cleaner, more maintainable code
   - Tags now clickable

2. **Individual Post Page** (`app/src/routes/posts/[slug]/+page.svelte`)
   - Refactored to use PostHeader component
   - Tags now clickable

### Features

- ✅ Tags display with `#` prefix throughout the app
- ✅ Tags are clickable and link to tag-specific pages
- ✅ Tag index page shows all tags with post counts
- ✅ Individual tag pages show all posts with that tag
- ✅ Pagination support on tag pages
- ✅ Consistent design across posts and tag pages
- ✅ Hover effects on tags for better UX
- ✅ Reusable components for maintainability

## Summary of Changes

Created three reusable components (PostCard, PostList, PostHeader) and two new route groups (tags index and individual tag pages). Refactored existing post routes to use the new components, making tags clickable hashtags throughout the application. All changes are linter-clean and follow the existing code patterns.
