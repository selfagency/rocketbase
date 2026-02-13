Title: Add drag-and-drop reordering for pages list (dnd-kit-svelte)
Type: feature
Status: todo
Priority: normal

Description:
Enable drag-and-drop reordering of pages in the admin pages list using `dnd-kit-svelte` (already installed).

Acceptance criteria:

- Admin pages list (`/admin/pages`) supports reordering via drag-and-drop.
- Reordering updates the `order` field on affected pages in PocketBase (batch update or per-item update).
- UI shows drag handles and provides keyboard accessible reordering where possible.
- Changes persist and affect the navigation order returned by `+layout.server.ts` which sorts by `order`.

Notes:

- Use `https://github.com/HanielU/dnd-kit-svelte`.
- Consider using an endpoint `/api/admin/pages/reorder` to accept new ordering and apply updates server-side (requires admin API key or authenticated request via `locals.pb`).
