import type { ILogLayer } from 'loglayer';

import errsole from 'errsole';
import ErrsoleSQLite from 'errsole-sqlite';
import { createProxyMiddleware } from 'http-proxy-middleware';
import os from 'os';
import path from 'path';
import polka from 'polka';

import initLogger from '../lib/server/logger';

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Express {
		interface Request {
			log: ILogLayer;
		}
	}
}

// Constants
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Init Errsole service
errsole.initialize({
	appName: 'rocketbase',
	collectLogs: ['error', 'warn', 'info'],
	enableConsoleOutput: false,
	enableDashboard: true,
	exitOnException: false,
	path: '/logs',
	port: port + 1,
	storage: new ErrsoleSQLite(
		process.env.LOG_DB_FILE ?? path.join(os.tmpdir(), 'rocketbase-logs.sqlite')
	)
});

// Init Polka server
const app = polka();

// Init logger service
const log = initLogger(errsole);

// Logger middleware
app.use((req, res, next) => {
	req.log = log.withContext({
		ip:
			req.headers['cloudflare-connecting-ip'] ??
			req.headers['x-forwarded-for'] ??
			req.headers['x-client-forwarded-for'] ??
			req.headers['remote-addr'] ??
			req.ip,
		method: req.method,
		path: req.path,
		requestId: crypto.randomUUID()
	});
	next();
});

// Proxy SvelteKit
if (process.env.NODE_ENV === 'development') {
	log.info('Running in development mode, enabling proxy middleware');
	app.use(createProxyMiddleware({ changeOrigin: false, target: 'http://localhost:5173' }));
} else {
	log.info('Running in production mode, loading SvelteKit handler');
	import(`${process.cwd()}/build/handler.js`).then((handler) => {
		app.use(handler.default);
	});
}

// Proxy Errsole dashboard
app.use('/logs', errsole.proxyMiddleware());

app.listen(port, (err: Error) => {
	if (err) throw err;
	log.info(`Server is running on http://localhost:${port}`);
});

export { app };
