import pino, { LoggerOptions, multistream, StreamEntry } from 'pino';
import pinoHttp from 'pino-http';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';

const LOG_DIR = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

const streams: StreamEntry[] = [
  {
    level: env.logLevel as pino.Level,
    stream: pino.transport({
      target: 'pino-roll',
      options: {
        file: path.join(LOG_DIR, 'combined'),
        frequency: 'daily',
        mkdir: true,
        extension: '.log',
        dateFormat: 'yyyy-MM-dd',
      },
    }),
  },
  {
    level: 'error',
    stream: pino.transport({
      target: 'pino-roll',
      options: {
        file: path.join(LOG_DIR, 'error'),
        frequency: 'daily',
        mkdir: true,
        extension: '.log',
        dateFormat: 'yyyy-MM-dd',
      },
    }),
  },
];

const baseOptions: LoggerOptions = {
  level: env.logLevel,
  base: { service: 'backend', env: env.nodeEnv, pid: process.pid },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.token', '*.secret'],
    censor: '[REDACTED]',
  },
};

export const logger = pino(baseOptions, multistream(streams, { dedupe: true }));

export const httpLogger = pinoHttp({
  logger,
  customProps: (req) => ({ requestId: (req as any).id }),
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      remoteAddress: req.remoteAddress,
    }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
});

