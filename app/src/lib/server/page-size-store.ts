import { get, writable } from 'svelte/store';

const ADMIN_POSTS_PER_PAGE_KEY = 'admin_posts_per_page';
const POSTS_PER_PAGE_KEY = 'posts_per_page';

const DEFAULT_ADMIN_POSTS_PER_PAGE = 10;
const DEFAULT_POSTS_PER_PAGE = 12;
const CACHE_TTL_MS = 60_000;

type PageSizeStoreValue = {
  adminPostsPerPage: number;
  postsPerPage: number;
  loadedAt: number;
};

type MetadataRecord = {
  key: string;
  value: unknown;
};

type MetadataCollection = {
  getFullList<T>(options?: Record<string, unknown>): Promise<T[]>;
};

type PocketBaseLike = {
  collection(name: string): MetadataCollection;
};

const pageSizeStore = writable<PageSizeStoreValue>({
  adminPostsPerPage: DEFAULT_ADMIN_POSTS_PER_PAGE,
  postsPerPage: DEFAULT_POSTS_PER_PAGE,
  loadedAt: 0,
});

function parsePageSize(value: unknown, fallback: number): number {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function refreshPageSizesFromMetadata(pb: PocketBaseLike): Promise<PageSizeStoreValue> {
  const metadata = await pb.collection('metadata').getFullList<MetadataRecord>({
    filter: `key = "${ADMIN_POSTS_PER_PAGE_KEY}" || key = "${POSTS_PER_PAGE_KEY}"`,
    fields: 'key,value',
  });

  const metadataMap = new Map(metadata.map(item => [item.key, item.value]));

  const nextValue: PageSizeStoreValue = {
    adminPostsPerPage: parsePageSize(metadataMap.get(ADMIN_POSTS_PER_PAGE_KEY), DEFAULT_ADMIN_POSTS_PER_PAGE),
    postsPerPage: parsePageSize(metadataMap.get(POSTS_PER_PAGE_KEY), DEFAULT_POSTS_PER_PAGE),
    loadedAt: Date.now(),
  };

  pageSizeStore.set(nextValue);
  return nextValue;
}

export async function getServerPageSizes(pb: PocketBaseLike): Promise<PageSizeStoreValue> {
  const current = get(pageSizeStore);

  if (Date.now() - current.loadedAt < CACHE_TTL_MS) {
    return current;
  }

  return refreshPageSizesFromMetadata(pb);
}
