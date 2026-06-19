import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnvFile } from 'node:process';
import { z } from 'zod';

const DEFAULTS = {
  FLIGHT_DATA_URL:
    'https://gist.githubusercontent.com/bgdavidx/132a9e3b9c70897bc07cfa5ca25747be/raw/8dbbe1db38087fad4a8c8ade48e741d6fad8c872/gistfile1.txt',
  OPENFLIGHTS_AIRPORT_DATA_URL:
    'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat',
} as const;

export const EnvConfigSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'staging', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().positive().default(3000),
  OPENFLIGHTS_AIRPORT_DATA_URL: z
    .url()
    .default(DEFAULTS.OPENFLIGHTS_AIRPORT_DATA_URL),
  FLIGHT_DATA_URL: z.url().default(DEFAULTS.FLIGHT_DATA_URL),
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
