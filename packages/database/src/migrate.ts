import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required');
  }

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);
  const migrationsFolder = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '../drizzle',
  );

  await migrate(db, { migrationsFolder });
  await client.end();
  console.log('Migrations completed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
