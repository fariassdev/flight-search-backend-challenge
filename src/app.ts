import express from 'express';
import { flightRoutes } from './modules/flight/flight.routes';

export function createApp() {
  const app = express();
  app.use('/api/flights', flightRoutes);
  return app;
}
