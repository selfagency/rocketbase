import type { Handle, RequestEvent, ServerInit } from '@sveltejs/kit';

import { building, dev } from '$app/environment';
import { env as pubEnv } from '$env/dynamic/public';
import { ConsolaTransport } from '@loglayer/transport-consola';
import { createConsola } from 'consola';
import errsole from 'errsole';
import ErrsoleSQLite from 'errsole-sqlite';
import { BlankTransport, LogLayer } from 'loglayer';
import os from 'os';
import path from 'path';
import { shake, uid } from 'radashi';

export async function logEvent(
	statusCode: number,
	event: RequestEvent,
	error?: unknown,
	errorId?: string
) {
	try {
		// Skip logging for internal requests
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

		// Get referrer and handle internal referrers
		let referer = event.request.headers.get('referer') || event.request.headers.get('referrer');
		if (referer) {
			try {
				const refererUrl = new URL(referer);
				const refererHostname = refererUrl.hostname;
				if (refererHostname === 'localhost' || refererHostname === pubEnv.PUBLIC_HOSTNAME) {
					referer = refererUrl.pathname;
				}
			} catch {
				// Invalid referrer URL, keep as is or set to null
				referer = null;
			}
		} else {
			referer = null;
		}

		const logData = {
			error: (error as Error).toString(),
			errorId: errorId,
			errorStackTrace: (error as Error)?.stack,
			headers: dev ? Object.fromEntries(event.request.headers.entries()) : undefined,
			ip: event.request.headers.get('x-forwarded-for') || event.request.headers.get('remote-addr'),
			method: event.request.method,
			pathname: event.url.pathname,
			referer: referer,
			status: statusCode,
			timeInMs: Date.now() - (event?.locals?.reqtime as number),
			url: event.url.toString(),
			userAgent: event.request.headers.get('user-agent')
		};

		event.locals.log.raw({
			logLevel: logData.error ? 'error' : 'info',
			messages: ['request'],
			metadata: shake(logData)
		});
	} catch (err) {
		event.locals.log.raw({ logLevel: 'error', metadata: err as Record<string, unknown> });
	}
}

let initialized = false;
export const init: ServerInit = async () => {
	if (!building && !initialized) {
		errsole.initialize({
			appName: 'rocketbase',
			collectLogs: ['error', 'warn', 'info'],
			path: '/logs',
			storage: new ErrsoleSQLite(path.join(os.tmpdir(), 'rocketbase-logs.sqlite'))
		});
		initialized = true;
	}
};

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.reqtime = Date.now();

	event.locals.log = new LogLayer({
		transport: [
			new BlankTransport({
				shipToLogger: ({ data, hasData, logLevel, messages }) => {
					switch (logLevel) {
						case 'debug':
							errsole.debug(...messages, data && hasData ? data : '');
							break;
						case 'error':
						case 'fatal':
							errsole.error(...messages, data && hasData ? data : '');
							break;
						case 'warn':
							errsole.warn(...messages, data && hasData ? data : '');
							break;
						case 'info':
						default:
							errsole.info(...messages, data && hasData ? data : '');
							break;
					}
					return messages;
				}
			}),
			new ConsolaTransport({
				logger: createConsola({
					level: 5
				})
			})
		]
	});

	const response = await resolve(event);
	return response;
};

export const handleError = async ({ error, event, status }) => {
	if (status !== 404) {
		const errorId = uid(32);

		logEvent(status, event, error, errorId);

		return {
			errorId,
			message: (error as Error)?.message || 'An error occurred'
		} as unknown as Error;
	}
};
