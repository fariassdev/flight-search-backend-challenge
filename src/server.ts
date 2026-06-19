import { createApp } from './app';
import { envConfig } from './config/env';
import { logger } from './shared/lib/logger';

const app = createApp();

const server = app.listen(envConfig.PORT, () => {
  logger.info({ port: envConfig.PORT }, 'Server started');
});

function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
