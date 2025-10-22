import type { RequestEvent } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { env as pubEnv } from '$env/dynamic/public';
import { shake } from 'radashi';

export async function logEvent(
	statusCode: number,
	event: RequestEvent,
	error?: unknown,
	errorId?: string
) {
	try {
		const pathname = event.url.pathname;

		if (
			(!dev && event.url.host === 'localhost:3000') ||
			pathname.startsWith('/_app/') ||
			pathname.includes('__data.json') ||
			pathname.endsWith('.js') ||
			pathname.endsWith('.css') ||
			pathname.endsWith('.map') ||
			pathname.includes('favicon')
		) {
			return;
		}

		let referer = event.request.headers.get('referer') || event.request.headers.get('referrer');
		if (referer) {
			try {
				const refererUrl = new URL(referer);
				const refererHostname = refererUrl.hostname;
				if (refererHostname === 'localhost' || refererHostname === pubEnv.PUBLIC_HOSTNAME) {
					referer = refererUrl.pathname;
				}
			} catch {
				referer = null;
			}
		} else {
			referer = null;
		}

		const logData = {
			error: (error as Error)?.toString(),
			errorId: errorId,
			errorStackTrace: (error as Error)?.stack,
			headers: dev ? Object.fromEntries(event.request.headers.entries()) : undefined,
			ip:
				event.request.headers.get('cf-connecting-ip') ||
				event.request.headers.get('x-forwarded-for') ||
				event.request.headers.get('remote-addr') ||
				event.getClientAddress(),
			method: event.request.method,
			pathname: event.url.pathname,
			referer: referer,
			status: statusCode,
			timeInMs: Date.now() - (event?.locals?.reqtime as number),
			url: event.url.toString(),
			userAgent: event.request.headers.get('user-agent')
		};

		error
			? event.locals.log.error('requestError', shake(logData))
			: event.locals.log.info('request', shake(logData));
	} catch (err) {
		event.locals.log.error(err);
	}
}
