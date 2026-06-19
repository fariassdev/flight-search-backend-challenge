import { pino, type LevelWithSilent, type LoggerOptions } from 'pino';
import { envConfig } from '../../config/env';

function resolveLogLevel(): LevelWithSilent {
  if (envConfig.LOG_LEVEL) {
    return envConfig.LOG_LEVEL;
  }
  if (envConfig.NODE_ENV === 'test') {
    return 'silent';
  }
  return envConfig.NODE_ENV === 'production' ? 'info' : 'debug';
}

function resolveTransport(): LoggerOptions['transport'] {
  const isDev = envConfig.NODE_ENV === 'development';

  return isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }
    : undefined;
}

export const logger = pino({
  level: resolveLogLevel(),
  transport: resolveTransport(),
});
