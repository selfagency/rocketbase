import type { PortfolioResponseWithExpanded } from '$lib/types/pocketbase-expanded';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

function isExpandedMediaRecord(value: unknown): value is { id: string } {
  return Boolean(value) && typeof value === 'object' && 'id' in (value as Record<string, unknown>);
}

export const load: PageServerLoad = async ({ params, locals, url }) => {
  const { pb } = locals;

  try {
    const item = await pb
      .collection('portfolio')
      .getFirstListItem<PortfolioResponseWithExpanded>(
        `slug = "${params.slug}" && published = true && visible = true`,
        {
          expand: 'media',
        }
      );

    const mediaValues = Array.isArray(item.media)
      ? item.media
      : typeof item.media === 'string' || isExpandedMediaRecord(item.media)
        ? [item.media]
        : [];

    const mediaIds = mediaValues.filter((value): value is string => typeof value === 'string' && value.length > 0);

    const flattenedExpandedMedia = mediaValues.filter(isExpandedMediaRecord);

    const expandedMediaFromExpand = Array.isArray(item.expand?.media)
      ? item.expand.media
      : item.expand?.media && typeof item.expand.media === 'object'
        ? [item.expand.media]
        : [];

    const expandedMediaCandidates: unknown[] =
      expandedMediaFromExpand.length > 0 ? [...expandedMediaFromExpand] : [...flattenedExpandedMedia];

    if (expandedMediaCandidates.length > 0) {
      item.expand = {
        ...item.expand,
        media: expandedMediaCandidates as NonNullable<PortfolioResponseWithExpanded['expand']>['media'],
      };
    } else if (mediaIds.length > 0) {
      const mediaFilter = mediaIds.map(id => `id = "${String(id).replaceAll('"', '\\"')}"`).join(' || ');

      if (mediaFilter) {
        const mediaRecords = await pb.collection('media').getFullList({ filter: mediaFilter });
        const mediaById = new Map(mediaRecords.map(record => [record.id, record]));
        const orderedMedia = mediaIds
          .map(id => mediaById.get(id))
          .filter((record): record is NonNullable<typeof record> => Boolean(record));

        item.expand = {
          ...item.expand,
          media: orderedMedia,
        };
      }
    }

    return { item };
  } catch (err) {
    locals.logger
      .withContext({
        route: url.pathname,
        userId: locals.pb?.authStore?.record?.id,
        requestId: locals.requestId,
      })
      .withMetadata(err as Error)
      .error('Unable to fetch portfolio item');

    throw error(404, 'Portfolio item not found');
  }
};
