import pino, { type LevelWithSilent } from 'pino';
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

export const logger = pino({
  level: resolveLogLevel(),
});
