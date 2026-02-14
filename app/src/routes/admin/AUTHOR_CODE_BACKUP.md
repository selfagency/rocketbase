# Author Column Code Backup

This code was removed from the pages admin but will be useful for the posts admin list.

## Server-side code (+page.server.ts)

```typescript
// Fetch all pages to build hierarchical structure
const result = await locals.pb.collection('pages').getList<PagesResponseWithAuthor>(1, 500, {
  sort,
  filter,
  fields: 'id,title,slug,author,parent,order,published,visible,image,created,updated',
  expand: 'author',
});

// Debug: Log the first item to see what PocketBase returns
if (result.items.length > 0) {
  console.log('[admin/pages] First page item:', JSON.stringify(result.items[0], null, 2));
  console.log('[admin/pages] Has expand?', !!(result.items[0] as any).expand);
  console.log('[admin/pages] Author field:', result.items[0].author);
  console.log('[admin/pages] Expand.author:', (result.items[0] as any).expand?.author);
}

// Fetch all users to build complete authors map (for filter dropdown)
const allUsers = await locals.pb.collection('users').getFullList({
  filter: 'role != "user"',
  fields: 'id,name,email',
});

// Build authors list from all users
const authorsMap = new Map<string, { id: string; name: string }>();
for (const user of allUsers) {
  authorsMap.set(user.id, { id: user.id, name: user.name || user.email || 'Unknown' });
}
const authors = Array.from(authorsMap.values());

// First pass: create map and add children array
for (const pageItem of result.items) {
  // PocketBase expand puts the expanded relation in pageItem.expand.author
  // We need to flatten it to pageItem.author for our type
  const author = (pageItem as any).expand?.author || pageItem.author;
  const pd = { ...pageItem, author } as PagesResponseWithAuthor;
  pageMap.set(pageItem.id, { ...pd, children: [] } as PageWithChildren);
}

// Return authors in load function
return {
  pages: paginatedPages,
  totalPages,
  page,
  perPage,
  totalItems: flatPages.length,
  status,
  authors, // <-- Include authors list
};
```

## Column definition (columns.ts)

```typescript
{
    accessorKey: 'author',
    header: m['admin.pages.author'](),
    meta: { sortKey: 'author' },
    cell: ({ row }) => {
        const authorSnippet = createRawSnippet<[{ author: any }]>(getData => {
            const { author } = getData();
            const authorName = author?.name || author?.email || m['admin.pages.unknown_author']();
            return {
                render: () => `<div class=\"text-sm\">${authorName}</div>`,
            };
        });
        return renderSnippet(authorSnippet, {
            author: row.original.author || {},
        });
    },
},
```

## Type definition (pocketbase-expanded.ts)

```typescript
/**
 * Augmented Pages type with author expanded and flattened
 */
export type PagesResponseWithAuthor = Omit<PagesResponse, 'author'> & {
  author?: UsersRecord | UsersResponse;
};
```

## Notes for Posts Implementation

- Use `expand: 'author'` in the PocketBase query
- Extract author from `postItem.expand.author` and flatten to `postItem.author`
- Build an authors map for the filter dropdown
- Include the authors list in the return value
- Create a `PostsResponseWithAuthor` type similar to the above
- Add author column to the posts columns definition
