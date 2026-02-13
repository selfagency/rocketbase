Title: Fix inconsistent logged-in state (appears logged out on 404)
Type: bug
Status: completed
Priority: high

Description:
Users occasionally appear logged out after visiting certain pages (e.g., hitting a 404). Investigate and fix the inconsistent logged-in status. Likely causes:

- `pb.authStore` not loaded for error/404 handlers or not propagated into `page.data` for those routes
- Hooks may not be loading auth cookie for all requests

Acceptance criteria:

- User state (authenticated user) is available in `page.data.user` on all pages including 404/error pages
- The nav shows consistent logged-in state regardless of route
- Tests or reproducer steps documented

Steps:

1. Review `src/hooks.server.ts` to ensure `pb.authStore.loadFromCookie` and `event.locals.user` initialization runs for all requests including errors
2. Ensure `+error.svelte` or 404 route uses `event.locals.user` or `page.data` to render correct state
3. Add small test or reproduction steps

## Summary of Changes

Updated `app/src/routes/+layout.server.ts` to include `user: locals.user` in the returned page data so authenticated user is available on all pages (including 404/error pages). This ensures the nav shows consistent logged-in state.
