import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnvFile } from 'node:process';
import { z } from 'zod';

const DEFAULTS = {
  CORS_ALLOWED_ORIGINS: ['http://localhost:3001'],
  CORS_METHODS: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  CORS_ALLOWED_HEADERS: ['Content-Type'],
  OPENFLIGHTS_AIRPORT_DATA_URL:
    'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat',
  FLIGHT_DATA_URL:
    'https://gist.githubusercontent.com/bgdavidx/132a9e3b9c70897bc07cfa5ca25747be/raw/8dbbe1db38087fad4a8c8ade48e741d6fad8c872/gistfile1.txt',
} as const;

function commaSeparated(defaults: readonly string[]) {
  return z
    .string()
    .optional()
    .transform((value) =>
      value
        ? value
            .split(',')
            .map((part) => part.trim())
            .filter(Boolean)
        : [...defaults],
    );
}

export const EnvConfigSchema = z.object({
  CORS_ALLOWED_ORIGINS: commaSeparated(DEFAULTS.CORS_ALLOWED_ORIGINS),
  CORS_METHODS: commaSeparated(DEFAULTS.CORS_METHODS),
  CORS_ALLOWED_HEADERS: commaSeparated(DEFAULTS.CORS_ALLOWED_HEADERS),
  FLIGHT_DATA_URL: z.url().default(DEFAULTS.FLIGHT_DATA_URL),
  NODE_ENV: z
    .enum(['development', 'staging', 'production', 'test'])
    .default('development'),
  OPENFLIGHTS_AIRPORT_DATA_URL: z
    .url()
    .default(DEFAULTS.OPENFLIGHTS_AIRPORT_DATA_URL),
  PORT: z.coerce.number().positive().default(3000),
});

function loadEnvFiles(): void {
  const nodeEnv = process.env.NODE_ENV ?? 'development';

  const baseFile = resolve(process.cwd(), '.env');
  if (existsSync(baseFile)) {
    loadEnvFile(baseFile);
  }

  const envFile = resolve(process.cwd(), `.env.${nodeEnv}`);
  if (existsSync(envFile)) {
    loadEnvFile(envFile);
  }
}

function buildEnvConfig(): EnvConfig {
  loadEnvFiles();

  const result = EnvConfigSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = z.flattenError(result.error).fieldErrors;

    console.error('❌ Invalid environment variables: ', formatted);
    process.exit(1);
  }

  return result.data;
}

export const envConfig = buildEnvConfig();
export type EnvConfig = z.infer<typeof EnvConfigSchema>;
