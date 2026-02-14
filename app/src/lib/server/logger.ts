import { PinoTransport } from '@loglayer/transport-pino';
import { LogLayer } from 'loglayer';
import pino from 'pino';

function createPinoLogger() {
  if (process.env.NODE_ENV !== 'production') {
    try {
      return pino({ transport: { target: 'pino-pretty' } });
    } catch {
      // pino-pretty not available (e.g. production build), fall through
    }
  }
  return pino();
}

const log = new LogLayer({
  transport: new PinoTransport({
    logger: createPinoLogger(),
  }),
  contextFieldName: 'context',
  metadataFieldName: 'metadata',
  errorFieldName: 'err',
  copyMsgOnOnlyError: true,
  consoleDebug: true,
});

export default log;
