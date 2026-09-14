import { z } from 'zod';
import {
  CARGO_TYPES,
  MILESTONE_STATUSES,
  MOVEMENT_TYPES,
  SHIPMENT_STATUSES,
  SYNC_STATUSES,
} from '../enums';
import { isoDateSchema, isoDateTimeSchema } from './common';

export const milestoneDtoSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: z.enum(MILESTONE_STATUSES),
  date_time: isoDateTimeSchema.nullable(),
  location: z.string().nullable(),
  notes: z.string().nullable(),
  photo: z.string().uuid().nullable(),
  last_updated: isoDateTimeSchema.nullable(),
  updated_by: z.string().nullable(),
  is_synced: z.boolean().optional(),
  synced_at: isoDateTimeSchema.nullable().optional(),
  sync_status: z.enum(SYNC_STATUSES).optional(),
  sync_error: z.string().nullable().optional(),
});

export const fileDtoSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  filename: z.string(),
  url: z.string(),
  mime_type: z.string(),
  size: z.number().int().nonnegative(),
  uploaded_by: z.string(),
  uploaded_at: isoDateTimeSchema,
});

export const shipmentListItemDtoSchema = z.object({
  id: z.string().uuid(),
  reference: z.string(),
  bol: z.string(),
  hbol: z.string(),
  container: z.string(),
  container_type: z.string(),
  carrier: z.string(),
  vessel: z.string(),
  voyage: z.string(),
  movement_type: z.enum(MOVEMENT_TYPES),
  status: z.enum(SHIPMENT_STATUSES),
  shipper: z.string(),
  consignee: z.string(),
  pol: z.string(),
  pod: z.string(),
  etd: isoDateSchema,
  eta: isoDateSchema,
  cargo_type: z.enum(CARGO_TYPES),
  container_size: z.string(),
  weight: z.string(),
  is_synced: z.boolean().optional(),
  synced_at: isoDateTimeSchema.nullable().optional(),
  sync_status: z.enum(SYNC_STATUSES).optional(),
  sync_error: z.string().nullable().optional(),
});

export const shipmentDetailDtoSchema = shipmentListItemDtoSchema.extend({
  milestones: z.array(milestoneDtoSchema),
  files: z.array(fileDtoSchema).optional(),
});

export const shipmentListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  status: z.enum(SHIPMENT_STATUSES).optional(),
  movement_type: z.enum(MOVEMENT_TYPES).optional(),
  pol: z.string().optional(),
  pod: z.string().optional(),
  date_from: isoDateSchema.optional(),
  date_to: isoDateSchema.optional(),
  sync_status: z.enum(SYNC_STATUSES).optional(),
});

export const updateMilestoneRequestSchema = z
  .object({
    status: z.enum(MILESTONE_STATUSES),
    date_time: isoDateTimeSchema.nullable().optional(),
    location: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    photo: z.string().uuid().nullable().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.status === 'done' && !value.date_time) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'date_time is required when status is done',
        path: ['date_time'],
      });
    }
  });

export type MilestoneDto = z.infer<typeof milestoneDtoSchema>;
export type ShipmentListItemDto = z.infer<typeof shipmentListItemDtoSchema>;
export type ShipmentDetailDto = z.infer<typeof shipmentDetailDtoSchema>;
export type ShipmentListQueryDto = z.infer<typeof shipmentListQuerySchema>;
export type UpdateMilestoneRequestDto = z.infer<typeof updateMilestoneRequestSchema>;
