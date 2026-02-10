import { ConsolaTransport } from '@loglayer/transport-consola';
import { createConsola } from 'consola';
import { ConsoleTransport, LogLayer } from 'loglayer';
import path from 'node:path';

import errsole from 'errsole';
import ErrsoleSQLite from 'errsole-sqlite';

errsole.initialize({
  storage: new ErrsoleSQLite(path.resolve(process.cwd(), '../db/logs.db')),
  appName: 'rocketbase-app',
  enableDashboard: false,
});

const log = new LogLayer({
  transport: [
    new ConsolaTransport({
      logger: createConsola({
        level: 5,
      }),
    }),
    new ConsoleTransport({
      logger: errsole as unknown as Console,
      appendObjectData: true,
    }),
  ],
});

export default log;
