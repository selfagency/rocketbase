import type { Handle, ServerInit } from '@sveltejs/kit';

import errsole from 'errsole';
import ErrsoleSQLite from 'errsole-sqlite';
// import { dev } from '$app/environment';
import { getReasonPhrase } from 'http-status-codes';
import crypto from 'node:crypto';
import os from 'os';
import path from 'path';
import { shake } from 'radashi';

import initLogger from './lib/server/logger';

export const init: ServerInit = async () => {
	errsole.initialize({
		appName: 'rocketbase',
		collectLogs: ['error', 'warn', 'info'],
		enableConsoleOutput: false,
		enableDashboard: false,
		exitOnException: false,
		path: '/logs',
		storage: new ErrsoleSQLite(
			process.env.LOG_DB_FILE ?? path.join(os.tmpdir(), 'rocketbase-logs.sqlite')
		)
	});
};

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.reqtime = Date.now();
	event.locals.log = initLogger(errsole).withContext(
		shake({
			// headers: dev ? Object.fromEntries(event.request.headers.entries()) : undefined,
			ip:
				event.request.headers.get('cloudflare-connecting-ip') ??
				event.request.headers.get('x-forwarded-for') ??
				event.request.headers.get('x-client-forwarded-for') ??
				event.request.headers.get('remote-addr') ??
				event.getClientAddress(),
			method: event.request.method,
			pathname: event.url.pathname,
			requestId: crypto.randomUUID(),
			timeInMs: Date.now() - (event?.locals?.reqtime as number),
			url: event.url.toString(),
			userAgent: event.request.headers.get('user-agent')
		})
	);

	const response = await resolve(event);
	const pathname = event.url.pathname;
	if (
		!(
			pathname.startsWith('/_app/') ||
			pathname.includes('__data.json') ||
			pathname.endsWith('.js') ||
			pathname.endsWith('.css') ||
			pathname.endsWith('.map') ||
			pathname.includes('favicon')
		)
	) {
		event.locals.log.info(
			`'${event.url.pathname}'`,
			`${response.status}: ${getReasonPhrase(response.status)}`
		);
	}
	return response;
};

export const handleError = async ({ error, event, status }) => {
	if (status !== 404) {
		const errorId = crypto.randomUUID();

		event.locals.log.error(
			`'${event.url.pathname}'`,
			`${status}: ${getReasonPhrase(status)}`,
			(error as Error)?.message,
			{
				error,
				errorId: errorId
			}
		);

		return {
			errorId,
			message: (error as Error)?.message || 'An error occurred'
		} as unknown as Error;
	}
};
