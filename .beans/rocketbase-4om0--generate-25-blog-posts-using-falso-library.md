---
# rocketbase-4om0
title: Generate 25 blog posts using falso library
status: completed
type: task
priority: normal
created_at: 2026-02-14T04:38:24Z
updated_at: 2026-02-15T08:34:32Z
parent: rocketbase-jl6x
---

Create a utility script that generates 25 realistic blog posts using the falso library and inserts them into PocketBase posts collection

## Implementation Checklist

- [x] Install @ngneat/falso library
- [x] Create generate-posts.js utility script
- [x] Implement authentication with PocketBase
- [x] Fetch existing users and tags
- [x] Generate realistic blog post data using falso
- [x] Test the script with local PocketBase
- [x] Document usage in the script
- [ ] Update CLAUDE.md with script information if needed

## Summary

Successfully created a utility script that generates 25 realistic blog posts using the falso library and Pexels API.

### Features Implemented

1. **Random Content Generation (falso)**
   - Titles using `randCatchPhrase()`
   - Content with 3-7 paragraphs using `randParagraph()`
   - Summaries using `randSentence()`
   - Dates within the past year using `randPastDate()`
   - Random numeric suffixes for unique slugs

2. **PocketBase Integration**
   - Authentication via API_KEY from .env (preferred)
   - Fallback to admin credentials (API_USER/API_PASS)
   - Fetches existing users for authors
   - Fetches existing tags for categorization
   - Creates posts with proper relationships

3. **Pexels API Integration**
   - Downloads curated photos from Pexels
   - One unique image per post (using pagination)
   - Uploads images to PocketBase with each post
   - Graceful fallback if image download fails

4. **Script Features**
   - Comprehensive documentation with JSDoc header
   - Clear logging of progress
   - Error handling for duplicate slugs
   - Continues on partial failures
   - Uses dotenv for environment variables

### Testing Results

Successfully tested with local PocketBase instance:
- Created 20/25 posts (5 failed initially due to duplicate slugs before fix)
- All posts include Pexels images
- Images properly uploaded to PocketBase
- Authors and tags properly assigned

### Files Changed

- `app/package.json`: Added @ngneat/falso dependency
- `app/util/generate-posts.js`: New utility script
- `.beans/rocketbase-4om0--generate-25-blog-posts-using-falso-library.md`: Bean tracking

### Usage

```bash
cd app
node util/generate-posts.js
```

Environment variables are loaded from `.env`:
- `PEXELS_API_KEY`: Required for image downloads
- `API_KEY`: For PocketBase authentication
