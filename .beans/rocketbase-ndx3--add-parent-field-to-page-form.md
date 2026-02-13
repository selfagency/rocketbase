Title: Add parent field support to Add/Edit Page form
Type: task
Status: todo
Priority: normal

Description:
The Add and Edit Page forms don't properly handle the `parent` field. Ensure the `parent` value is included and submitted when creating and updating pages so pages can be nested under a parent.

Acceptance criteria:

- The Add Page form (`/admin/pages/new`) includes the `parent` field and submits it to PocketBase when present.
- The Edit Page form (`/admin/pages/[id]`) pre-fills the `parent` field and includes it on update.
- When a parent is set, the resulting page URL or hierarchical display reflects the parent-child relationship.

Notes:

- `page-form.svelte` already renders a `parent` field in the form data; ensure server handlers in `+page.server.ts` for create/update append `parent` to the FormData sent to PocketBase.
