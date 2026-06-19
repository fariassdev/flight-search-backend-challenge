import cors from 'cors';
import express, { json, urlencoded } from 'express';
import helmet from 'helmet';
import { envConfig } from './config/env';
import { flightRoutes } from './modules/flight/flight.routes';
import { errorHandler } from './shared/middleware/errorHandler';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: envConfig.CORS_ALLOWED_ORIGINS,
      methods: envConfig.CORS_METHODS,
      allowedHeaders: envConfig.CORS_ALLOWED_HEADERS,
    }),
  );
  app.use(json({ limit: envConfig.BODY_PARSER_JSON_LIMIT }));
  app.use(urlencoded({ limit: envConfig.BODY_PARSER_URLENCODED_LIMIT }));

  app.use('/api/flights', flightRoutes);
  app.use(errorHandler);
  return app;
}
