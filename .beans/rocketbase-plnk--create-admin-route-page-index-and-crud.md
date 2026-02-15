---
# rocketbase-plnk
title: Create admin route - page index and CRUD
status: completed
type: task
priority: normal
created_at: 2026-02-12T20:11:21Z
updated_at: 2026-02-15T08:34:32Z
parent: rocketbase-iaak
---

Imported from issues.jsonl (rocketbase-2ah). Owner: daniel@self.agency. Created by Daniel Sieradski 2026-02-11T00:42:33.147234-05:00.

## Progress Update

Created admin route for pages with role-based access control:

### Files Created:
1. **Role-based access control** ()
   - Requires editor or admin role
   - Returns 401 for unauthenticated, 403 for unauthorized

2. **Index page with data table**
   - Server-side pagination using PocketBase API
   - Server-side search/filtering
   - Columns: title (linked), slug, published status, order, created date, actions
   - Delete action with confirmation

3. **Create page** ()
   - Form with all page fields
   - Auto-generates slug from title
   - File upload for featured image  
   - Boolean switches for published, require_login, subscriber_only

4. **Edit page** ()
   - Pre-populated form with existing data
   - Same validation as create

5. **Reusable components**
   -  - Shared form for create/edit
   -  - Server-side paginated table
   -  - Row actions menu
   -  - Table column definitions
   -  - Zod validation schema

### Features Implemented:
- ✅ Role-based access (editor/admin only)  
- ✅ Server-side pagination via PocketBase
- ✅ Server-side search/filtering  
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Data table with sorting
- ✅ Form validation with Superforms + Zod
- ✅ File uploads (featured image)
- ✅ Auto-slug generation

### Remaining Tasks:
- [ ] Fix Svelte 5 component import warnings
- [ ] Test the admin routes work correctly
- [ ] Add tests
