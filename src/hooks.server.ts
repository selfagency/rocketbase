import type { Handle, RequestEvent, ServerInit } from '@sveltejs/kit';

import { building, dev } from '$app/environment';
import { ConsolaTransport } from '@loglayer/transport-consola';
import { createConsola } from 'consola';
import errsole from 'errsole';
import ErrsoleSQLite from 'errsole-sqlite';
import { BlankTransport, LogLayer } from 'loglayer';
import os from 'os';
import path from 'path';
import { shake, uid } from 'radashi';
import { logEvent } from '$lib/server/logger';
import { env } from '$env/dynamic/private';

let initialized = false;
export const init: ServerInit = async () => {
	if (!building && !initialized) {
		errsole.initialize({
			appName: 'rocketbase',
			collectLogs: ['error', 'warn', 'info'],
			path: '/logs',
			storage: new ErrsoleSQLite(
				env.LOG_DB_FILE ?? path.join(os.tmpdir(), 'rocketbase-logs.sqlite')
			)
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
	logEvent(response.status, event);
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
