import { z } from 'zod';

export const paginationMetaSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  total_pages: z.number().int().nonnegative(),
});

export type PaginationMetaDto = z.infer<typeof paginationMetaSchema>;

export function successResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
  });
}

export function paginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    success: z.literal(true),
    message: z.string(),
    data: z.array(itemSchema),
    meta: paginationMetaSchema,
  });
}

export const errorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  errors: z.record(z.array(z.string())).optional(),
});

export type ErrorResponseDto = z.infer<typeof errorResponseSchema>;

export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const isoDateTimeSchema = z.string().datetime({ offset: true });
