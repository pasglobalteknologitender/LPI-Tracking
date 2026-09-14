import { integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const importBatchStatusEnum = pgEnum('import_batch_status', [
  'uploaded',
  'parsing',
  'ready',
  'committing',
  'completed',
  'failed',
]);

export const importRowStatusEnum = pgEnum('import_row_status', [
  'valid',
  'invalid',
  'imported',
  'skipped',
]);

export const importBatches = pgTable('import_batches', {
  id: uuid('id').primaryKey().defaultRandom(),
  filename: text('filename').notNull(),
  status: importBatchStatusEnum('status').notNull().default('uploaded'),
  totalRows: integer('total_rows').notNull().default(0),
  validRows: integer('valid_rows').notNull().default(0),
  invalidRows: integer('invalid_rows').notNull().default(0),
  importedRows: integer('imported_rows').notNull().default(0),
  skippedRows: integer('skipped_rows').notNull().default(0),
  createdById: uuid('created_by_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true, mode: 'string' }),
});

export const importRows = pgTable('import_rows', {
  id: uuid('id').primaryKey().defaultRandom(),
  batchId: uuid('batch_id')
    .notNull()
    .references(() => importBatches.id, { onDelete: 'cascade' }),
  rowNumber: integer('row_number').notNull(),
  status: importRowStatusEnum('status').notNull().default('valid'),
  reference: text('reference'),
  container: text('container'),
  rawData: jsonb('raw_data').notNull().default({}),
  errors: jsonb('errors').notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),
});
