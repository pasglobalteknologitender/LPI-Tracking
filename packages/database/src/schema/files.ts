import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { milestones, shipments } from './shipments.js';
import { users } from './users.js';

export const files = pgTable('files', {
  id: uuid('id').primaryKey().defaultRandom(),
  shipmentId: uuid('shipment_id')
    .notNull()
    .references(() => shipments.id, { onDelete: 'cascade' }),
  milestoneId: uuid('milestone_id').references(() => milestones.id, {
    onDelete: 'set null',
  }),
  type: text('type').notNull(),
  filename: text('filename').notNull(),
  storagePath: text('storage_path').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  description: text('description'),
  uploadedById: uuid('uploaded_by_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),
});
