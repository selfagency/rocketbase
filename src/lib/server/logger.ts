import { ConsolaTransport } from '@loglayer/transport-consola';
import { createConsola } from 'consola';
import Errsole from 'errsole';
import { BlankTransport, LogLayer } from 'loglayer';

export default function initLogger(errsole: typeof Errsole) {
	return new LogLayer({
		transport: [
			new ConsolaTransport({
				logger: createConsola({
					level: 5
				})
			}),
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
			})
		]
	});
}
