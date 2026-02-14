import { createPocketBaseClient } from '$lib/server/pocketbase';
import { get, writable } from 'svelte/store';
import type { RedirectsResponse } from '../types/pocketbase';

// In-memory cache for redirects with a simple TTL
const TTL = 60 * 1000; // 60s

type RedirectsCache = {
  redirects: RedirectsResponse[];
  lastFetched: number;
} | null;

const cache = writable<RedirectsCache>(null);

export async function getCachedRedirects(force = false): Promise<RedirectsResponse[]> {
  const current = get(cache);
  const now = Date.now();

  if (!force && current && now - current.lastFetched < TTL) {
    return current.redirects;
  }

  // Fetch fresh redirects from PocketBase
  const pb = createPocketBaseClient();
  const redirects = await pb.collection('redirects').getFullList<RedirectsResponse>({
    filter: 'slug != ""',
  });

  cache.set({ redirects, lastFetched: now });
  return redirects;
}

export function clearRedirectCache() {
  cache.set(null);
}

// Expose the store for debugging or admin tooling if needed
export { cache as redirectsCacheStore };
