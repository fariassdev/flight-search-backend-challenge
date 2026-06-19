import { createApp } from './app';
import { envConfig } from './config/env';

const app = createApp();

const server = app.listen(envConfig.PORT, () => {
  console.log(`Server running on port ${envConfig.PORT}`);
});

function shutdown() {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
