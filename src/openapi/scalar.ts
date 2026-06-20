import type { HelmetOptions } from 'helmet';
import { generateOpenApiDocument } from './document';

function buildScalarConfig() {
  return {
    content: generateOpenApiDocument,
    theme: 'purple',
    hideClientButton: true,
    agent: {
      disabled: true,
    },
  };
}

function buildScalarHelmetConfig(): HelmetOptions {
  return {
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
  };
}

export const scalarConfig = buildScalarConfig();
export const scalarHelmetConfig = buildScalarHelmetConfig();
