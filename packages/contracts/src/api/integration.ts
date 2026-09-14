import { z } from 'zod';
import {
  INTEGRATION_DELIVERY_STATUSES,
  INTEGRATION_OPERATIONS,
} from '../enums';
import { isoDateTimeSchema } from './common';

export const integrationDeliveryDtoSchema = z.object({
  id: z.string().uuid(),
  shipment_id: z.string().uuid(),
  operation: z.enum(INTEGRATION_OPERATIONS),
  status: z.enum(INTEGRATION_DELIVERY_STATUSES),
  http_status: z.number().int().nullable(),
  attempts: z.number().int().nonnegative(),
  idempotency_key: z.string(),
  payload: z.record(z.unknown()),
  response: z.record(z.unknown()).nullable(),
  error_message: z.string().nullable(),
  correlation_id: z.string().nullable(),
  created_at: isoDateTimeSchema,
  updated_at: isoDateTimeSchema,
  next_retry_at: isoDateTimeSchema.nullable(),
});

export const auditLogDtoSchema = z.object({
  id: z.string().uuid(),
  action: z.string(),
  description: z.string(),
  shipment_id: z.string().uuid().nullable(),
  shipment_reference: z.string().nullable(),
  user_id: z.string().uuid().nullable(),
  user_name: z.string().nullable(),
  metadata: z.record(z.unknown()).nullable(),
  created_at: isoDateTimeSchema,
});

export const transvoyantLogDtoSchema = z.object({
  id: z.string().uuid(),
  shipment: z.string(),
  shipment_id: z.string().uuid(),
  type: z.enum(['Pre-Transportation', 'During Transportation']),
  endpoint: z.string(),
  status: z.enum(['Success', 'Failed']),
  code: z.number().int(),
  retry: z.number().int().nonnegative(),
  timestamp: z.string(),
  request: z.record(z.unknown()),
  response: z.record(z.unknown()).nullable(),
});

export const logListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  status: z.enum(['Success', 'Failed']).optional(),
  type: z.enum(['Pre-Transportation', 'During Transportation']).optional(),
});

export type IntegrationDeliveryDto = z.infer<typeof integrationDeliveryDtoSchema>;
export type AuditLogDto = z.infer<typeof auditLogDtoSchema>;
export type TransvoyantLogDto = z.infer<typeof transvoyantLogDtoSchema>;
export type LogListQueryDto = z.infer<typeof logListQuerySchema>;
