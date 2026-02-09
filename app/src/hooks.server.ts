import { paraglideMiddleware } from '$lib/paraglide/server';
import { createPocketBaseClient } from '$lib/pocketbase';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import type { UsersResponse } from './pocketbase';

const handleAuth: Handle = async ({ event, resolve }) => {
	event.locals.pb = createPocketBaseClient();

	// Load auth store from cookie
	event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

	try {
		// Refresh auth if valid
		if (event.locals.pb.authStore.isValid) {
			await event.locals.pb.collection('users').authRefresh();
		}
	} catch (_) {
		// Clear auth on failed refresh
		event.locals.pb.authStore.clear();
	}

	event.locals.user = event.locals.pb.authStore.record as unknown as UsersResponse | null;

	const response = await resolve(event);

	// Set auth cookie in response
	response.headers.append(
		'set-cookie',
		event.locals.pb.authStore.exportToCookie({ httpOnly: false })
	);

	return response;
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

export const handle: Handle = sequence(handleAuth, handleParaglide);
