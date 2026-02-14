import { buildHierarchy, metadataListToObject, type PageItem } from '$lib/server/nav';
import type { MetadataResponse } from '$lib/types/pocketbase';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  const { pb } = locals;

  // Query pages collection — only published + visible pages appear in nav
  const pages = await pb.collection('pages').getFullList<PageItem>({
    fields: 'id,title,slug,order,parent,summary,published,visible',
    filter: 'published = true && visible = true',
    sort: 'order',
  });

  // Build hierarchical structure
  const navItems = buildHierarchy(pages);

  // Load site-wide metadata for SEO
  const metadata = await pb.collection('metadata').getFullList<MetadataResponse>({
    fields: 'key,value,type',
  });

  return {
    navItems,
    user: locals.user ?? null,
    metadata: metadataListToObject(metadata),
    url: url.origin,
  };
};
