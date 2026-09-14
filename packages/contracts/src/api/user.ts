import { z } from 'zod';
import { USER_ROLES, USER_STATUSES } from '../enums';
import { isoDateTimeSchema } from './common';

export const userDtoSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(USER_ROLES),
  status: z.enum(USER_STATUSES),
  last_login: isoDateTimeSchema.nullable().optional(),
});

export const userDetailDtoSchema = userDtoSchema.extend({
  created_at: isoDateTimeSchema,
  updated_at: isoDateTimeSchema,
});

export const createUserRequestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(USER_ROLES),
  status: z.enum(USER_STATUSES).default('active'),
});

export const updateUserRequestSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(USER_ROLES).optional(),
  status: z.enum(USER_STATUSES).optional(),
});

export const userListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  role: z.enum(USER_ROLES).optional(),
  status: z.enum(USER_STATUSES).optional(),
});

export type UserDto = z.infer<typeof userDtoSchema>;
export type UserDetailDto = z.infer<typeof userDetailDtoSchema>;
export type CreateUserRequestDto = z.infer<typeof createUserRequestSchema>;
export type UpdateUserRequestDto = z.infer<typeof updateUserRequestSchema>;
export type UserListQueryDto = z.infer<typeof userListQuerySchema>;
