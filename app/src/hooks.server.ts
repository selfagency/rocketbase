import { paraglideMiddleware } from '$lib/paraglide/server';
import logger from '$lib/server/logger';
import { createPocketBaseClient } from '$lib/server/pocketbase';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { redirect } from '@sveltejs/kit';
import crypto from 'node:crypto';
import type { RedirectsResponse, UsersResponse } from './lib/types/pocketbase';

const generateRequestId: Handle = async ({ event, resolve }) => {
  const requestId = crypto.randomUUID();
  event.locals.requestId = requestId;

  // attach request id to SvelteKit tracing spans when available
  try {
    if (event?.tracing?.root?.setAttribute) {
      event.tracing.root.setAttribute('request.id', requestId);
    }
    if (event?.tracing?.current?.setAttribute) {
      event.tracing.current.setAttribute('request.id', requestId);
    }
  } catch (e) {
    // ignore if tracing API isn't present
  }

  const response = await resolve(event);
  response.headers.set('X-Request-ID', requestId);
  return response;
};

const handleAuth: Handle = async ({ event, resolve }) => {
  event.locals.logger = logger;
  event.locals.pb = createPocketBaseClient();

  // Load auth store from cookie
  event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

  try {
    // Refresh auth if valid
    if (event.locals.pb.authStore.isValid) {
      await event.locals.pb.collection('users').authRefresh();
    }
  } catch {
    // Clear auth on failed refresh
    event.locals.pb.authStore.clear();
  }

  event.locals.user = event.locals.pb.authStore.record as unknown as UsersResponse | null;
  const response = await resolve(event);

  // Set auth cookie in response
  response.headers.append('set-cookie', event.locals.pb.authStore.exportToCookie({ httpOnly: false }));

  return response;
};

const handleRedirects: Handle = async ({ event, resolve }) => {
  // Skip redirects for API routes and static assets
  if (event.url.pathname.startsWith('/api/') || event.url.pathname.startsWith('/_app/')) {
    return resolve(event);
  }

  try {
    // Query redirects collection - this will use the PB client initialized in handleAuth
    // TODO: Add caching layer to avoid querying PocketBase on every request
    // Consider using a Map with TTL or node-cache for in-memory caching
    const pb = createPocketBaseClient();
    const redirects = await pb.collection('redirects').getFullList<RedirectsResponse>({
      filter: 'slug != ""',
    });

    // Normalize the pathname (remove trailing slash for comparison)
    const pathname = event.url.pathname.replace(/\/$/, '') || '/';

    // Find matching redirect
    const matchedRedirect = redirects.find((r) => {
      const redirectSlug = r.slug?.replace(/^\//, '').replace(/\/$/, '');
      const normalizedPathname = pathname.replace(/^\//, '');
      return redirectSlug === normalizedPathname;
    });

    if (matchedRedirect?.url) {
      // Use 302 (temporary redirect) by default
      // TODO: Add status code field to redirects collection for 301/302 control
      redirect(302, matchedRedirect.url);
    }
  } catch (error) {
    // Log error but don't break the request flow
    logger.error('Failed to check redirects', error instanceof Error ? error.message : String(error));
  }

  return resolve(event);
};

const handleParaglide: Handle = ({ event, resolve }) =>
  paraglideMiddleware(event.request, ({ request, locale }) => {
    event.request = request;

    return resolve(event, {
      transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale),
    });
  });

export const handle: Handle = sequence(generateRequestId, handleAuth, handleRedirects, handleParaglide);
