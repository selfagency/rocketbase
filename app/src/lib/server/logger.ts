import { PinoTransport } from '@loglayer/transport-pino';
import { LogLayer } from 'loglayer';
import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

const log = new LogLayer({
  transport: new PinoTransport({
    logger: pino(isDev ? { transport: { target: 'pino-pretty' } } : {}),
  }),
  contextFieldName: 'context',
  metadataFieldName: 'metadata',
  errorFieldName: 'err',
  copyMsgOnOnlyError: true,
});

export default log;
