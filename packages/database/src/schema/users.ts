import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['admin', 'operator', 'viewer']);
export const userStatusEnum = pgEnum('user_status', ['active', 'inactive']);

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    role: userRoleEnum('role').notNull(),
    status: userStatusEnum('status').notNull().default('active'),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('users_email_lower_unique').on(table.email),
  ],
);

export const refreshSessions = pgTable('refresh_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),
  revokedAt: timestamp('revoked_at', { withTimezone: true, mode: 'string' }),
});
