import express from 'express';
import { flightRoutes } from './modules/flight/flight.routes';
import { errorHandler } from './shared/middleware/errorHandler';

export function createApp() {
  const app = express();
  app.use('/api/flights', flightRoutes);
  app.use(errorHandler);
  return app;
}
