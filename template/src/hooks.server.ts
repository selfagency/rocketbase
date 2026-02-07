import { API_ENDPOINT } from '$env/static/private';
import { paraglideMiddleware } from '$lib/paraglide/server';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const handleParaglide: Handle = ({ event, resolve }) =>
  paraglideMiddleware(event.request, ({ request, locale }) => {
    event.request = request;

    return resolve(event, {
      transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale),
    });
  });

const PROXY_PATH = '/api';

const handleApiProxy: Handle = async ({ event, resolve }) => {
  if (event.url.pathname.startsWith(PROXY_PATH)) {
    // const origin = event.request.headers.get('Origin');

    // reject requests that don't come from the webapp, to avoid your proxy being abused.
    // if (!origin || new URL(origin).origin !== event.url.origin) {
    //   throw error(403, 'Request Forbidden.');
    // }

    // strip `/api-proxy` from the request path
    const strippedPath = event.url.pathname.substring(PROXY_PATH.length);

    // build the new URL path with your API base URL, the stripped path and the query string
    const urlPath = `${API_ENDPOINT}${strippedPath}${event.url.search}`;
    const proxiedUrl = new URL(urlPath);

    // Strip off header added by SvelteKit yet forbidden by underlying HTTP request
    // library `undici`.
    // https://github.com/nodejs/undici/issues/1470
    event.request.headers.delete('connection');

    return fetch(proxiedUrl.toString(), {
      // propagate the request method and body
      body: event.request.body,
      method: event.request.method,
      headers: event.request.headers,
    }).catch(err => {
      console.log('Could not proxy API request: ', err);
      throw err;
    });
  }

  return resolve(event);
};

export const handle: Handle = sequence(handleApiProxy, handleParaglide);
