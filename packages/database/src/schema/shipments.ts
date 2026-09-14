import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const movementTypeEnum = pgEnum('movement_type', ['D2D', 'D2P']);
export const shipmentStatusEnum = pgEnum('shipment_status', [
  'Pending',
  'Booked',
  'Picked Up',
  'At POL',
  'Loaded',
  'Departed',
  'At POD',
  'Unloaded',
  'Customs',
  'Out-Gate',
  'Delivered',
  'Returned',
]);
export const cargoTypeEnum = pgEnum('cargo_type', ['FCL', 'LCL']);
export const milestoneStatusEnum = pgEnum('milestone_status', ['pending', 'done']);

export const shipments = pgTable('shipments', {
  id: uuid('id').primaryKey().defaultRandom(),
  reference: text('reference').notNull(),
  bol: text('bol').notNull().default(''),
  hbol: text('hbol').notNull().default(''),
  carrier: text('carrier').notNull().default(''),
  carrierScac: text('carrier_scac').notNull().default(''),
  vessel: text('vessel').notNull().default(''),
  voyage: text('voyage').notNull().default(''),
  movementType: movementTypeEnum('movement_type').notNull().default('D2D'),
  status: shipmentStatusEnum('status').notNull().default('Pending'),
  shipper: text('shipper').notNull().default(''),
  consignee: text('consignee').notNull().default(''),
  pol: text('pol').notNull().default(''),
  pod: text('pod').notNull().default(''),
  etd: text('etd').notNull(),
  eta: text('eta').notNull(),
  cargoType: cargoTypeEnum('cargo_type').notNull().default('FCL'),
  containerSize: text('container_size').notNull().default(''),
  weight: text('weight').notNull().default(''),
  version: integer('version').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),
});

export const shipmentContainers = pgTable(
  'shipment_containers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    shipmentId: uuid('shipment_id')
      .notNull()
      .references(() => shipments.id, { onDelete: 'cascade' }),
    reference: text('reference').notNull(),
    container: text('container').notNull(),
    containerType: text('container_type').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('reference_container_unique').on(table.reference, table.container),
  ],
);

export const milestones = pgTable('milestones', {
  id: uuid('id').primaryKey().defaultRandom(),
  shipmentId: uuid('shipment_id')
    .notNull()
    .references(() => shipments.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  status: milestoneStatusEnum('status').notNull().default('pending'),
  dateTime: timestamp('date_time', { withTimezone: true, mode: 'string' }),
  location: text('location'),
  notes: text('notes'),
  photoFileId: uuid('photo_file_id'),
  lastUpdatedAt: timestamp('last_updated_at', { withTimezone: true, mode: 'string' }),
  updatedById: uuid('updated_by_id').references(() => users.id),
  version: integer('version').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),
});
