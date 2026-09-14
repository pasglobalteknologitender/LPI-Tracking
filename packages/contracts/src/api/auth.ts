import { z } from 'zod';
import { USER_ROLES } from '../enums';
import { isoDateTimeSchema } from './common';

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(USER_ROLES),
});

export const loginResponseDataSchema = z.object({
  access_token: z.string(),
  token_type: z.literal('Bearer'),
  expires_in: z.number().int().positive(),
  user: authUserSchema,
});

export const meResponseDataSchema = authUserSchema.extend({
  last_login: isoDateTimeSchema.nullable().optional(),
});

export type LoginRequestDto = z.infer<typeof loginRequestSchema>;
export type AuthUserDto = z.infer<typeof authUserSchema>;
export type LoginResponseDataDto = z.infer<typeof loginResponseDataSchema>;
export type MeResponseDataDto = z.infer<typeof meResponseDataSchema>;
