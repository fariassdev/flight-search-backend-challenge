import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { flightRoutes } from './modules/flight/flight.routes';
import { errorHandler } from './shared/middleware/errorHandler';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());

  app.use('/api/flights', flightRoutes);
  app.use(errorHandler);
  return app;
}
