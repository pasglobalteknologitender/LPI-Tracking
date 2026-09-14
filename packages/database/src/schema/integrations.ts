import { integer, jsonb, pgEnum, pgTable, text, timestamp, uuid, uniqueIndex } from 'drizzle-orm/pg-core';
import { milestones, shipments } from './shipments.js';
import { users } from './users.js';

export const integrationDeliveryStatusEnum = pgEnum('integration_delivery_status', [
  'pending',
  'processing',
  'succeeded',
  'retry_scheduled',
  'failed',
  'dead',
]);

export const integrationOperationEnum = pgEnum('integration_operation', [
  'shipment_attributes',
  'shipment_event',
]);

export const integrationDeliveries = pgTable(
  'integration_deliveries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    shipmentId: uuid('shipment_id')
      .notNull()
      .references(() => shipments.id, { onDelete: 'cascade' }),
    milestoneId: uuid('milestone_id').references(() => milestones.id, {
      onDelete: 'set null',
    }),
    operation: integrationOperationEnum('operation').notNull(),
    status: integrationDeliveryStatusEnum('status').notNull().default('pending'),
    httpStatus: integer('http_status'),
    attempts: integer('attempts').notNull().default(0),
    maxAttempts: integer('max_attempts').notNull().default(5),
    idempotencyKey: text('idempotency_key').notNull(),
    payload: jsonb('payload').notNull().default({}),
    response: jsonb('response'),
    errorMessage: text('error_message'),
    correlationId: text('correlation_id'),
    nextRetryAt: timestamp('next_retry_at', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('integration_deliveries_idempotency_key_unique').on(
      table.idempotencyKey,
    ),
  ],
);

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  action: text('action').notNull(),
  description: text('description').notNull(),
  shipmentId: uuid('shipment_id').references(() => shipments.id, {
    onDelete: 'set null',
  }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),
});
