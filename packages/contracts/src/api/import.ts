import { z } from 'zod';
import { IMPORT_BATCH_STATUSES, IMPORT_ROW_STATUSES } from '../enums';
import { isoDateTimeSchema } from './common';

export const importBatchDtoSchema = z.object({
  id: z.string().uuid(),
  filename: z.string(),
  status: z.enum(IMPORT_BATCH_STATUSES),
  total_rows: z.number().int().nonnegative(),
  valid_rows: z.number().int().nonnegative(),
  invalid_rows: z.number().int().nonnegative(),
  imported_rows: z.number().int().nonnegative(),
  skipped_rows: z.number().int().nonnegative(),
  created_at: isoDateTimeSchema,
  updated_at: isoDateTimeSchema,
  completed_at: isoDateTimeSchema.nullable(),
});

export const importRowErrorSchema = z.object({
  row_number: z.number().int().positive(),
  reference: z.string().nullable(),
  container: z.string().nullable(),
  field: z.string(),
  reason: z.string(),
});

export type ImportBatchDto = z.infer<typeof importBatchDtoSchema>;
export type ImportRowErrorDto = z.infer<typeof importRowErrorSchema>;
