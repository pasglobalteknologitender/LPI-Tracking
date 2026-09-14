#!/bin/sh
set -eu

echo "Running database migrations..."
npx tsx packages/database/src/migrate.ts

echo "Starting API..."
exec npx tsx apps/api/src/index.ts
