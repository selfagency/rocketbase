import { paraglideMiddleware } from '$lib/paraglide/server';
import logger from '$lib/server/logger';
import { createPocketBaseClient } from '$lib/server/pocketbase';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import crypto from 'node:crypto';
import type { UsersResponse } from './lib/types/pocketbase';

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

const handleParaglide: Handle = ({ event, resolve }) =>
  paraglideMiddleware(event.request, ({ request, locale }) => {
    event.request = request;

    return resolve(event, {
      transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale),
    });
  });

export const handle: Handle = sequence(generateRequestId, handleAuth, handleParaglide);
