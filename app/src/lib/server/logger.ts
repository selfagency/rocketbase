import { ConsolaTransport } from '@loglayer/transport-consola';
import { createConsola } from 'consola';
import { ConsoleTransport, LogLayer } from 'loglayer';
import path from 'node:path';

import errsole from 'errsole';
import ErrsoleSQLite from 'errsole-sqlite';

// Initialize errsole safely - don't break the app if it fails
try {
  errsole.initialize({
    storage: new ErrsoleSQLite(path.resolve(process.cwd(), '../db/logs.db')),
    appName: 'rocketbase-app',
    enableDashboard: false,
  });
} catch (err) {
  console.warn('Failed to initialize errsole logger:', err);
}

const log = new LogLayer({
  transport: [
    new ConsolaTransport({
      logger: createConsola({
        level: 5,
      }),
    }),
    // Only add errsole if it initialized successfully
    ...(errsole
      ? [
          new ConsoleTransport({
            logger: errsole as unknown as Console,
            appendObjectData: true,
          }),
        ]
      : []),
  ],
});

export default log;
