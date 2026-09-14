import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema/index.js';

export function createDb(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) {
    throw new Error('DATABASE_URL is required');
  }

  const client = postgres(connectionString, { max: 10 });
  return drizzle(client, { schema });
}

export type Database = ReturnType<typeof createDb>;
export * from './schema/index.js';
