import { apiReference } from '@scalar/express-api-reference';
import { Router } from 'express';
import helmet from 'helmet';
import { generateOpenApiDocument } from './document';

export const docsRoute = Router();

const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: [`'self'`],
      styleSrc: [`'self'`, `'unsafe-inline'`],
      imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
      scriptSrc: [`'self'`, 'https:', `'unsafe-inline'`, `'unsafe-eval'`],
      connectSrc: [
        `'self'`,
        'https://cdn.jsdelivr.net',
        'https://api.scalar.com',
      ],
      fontSrc: [
        `'self'`,
        'https://fonts.scalar.com',
        'https://fonts.gstatic.com',
        'data:',
      ],
    },
  },
});

const scalarHandler = apiReference({
  content: generateOpenApiDocument,
  theme: 'purple',
  pageTitle: 'Flight Search API Docs',
  hideClientButton: true,
  agent: {
    disabled: true,
  },
});

docsRoute.use(helmetMiddleware);
docsRoute.use(scalarHandler);
