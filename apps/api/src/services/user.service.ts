import { and, desc, eq, ilike, or, sql, type SQL } from 'drizzle-orm';
import type {
  CreateUserRequestDto,
  UpdateUserRequestDto,
  UserDto,
  UserListQueryDto,
} from '@lpi/contracts';
import type { Database } from '@lpi/database';
import { users } from '@lpi/database';
import { hashPassword } from '../lib/password.js';

export class UserServiceError extends Error {
  constructor(
    message: string,
    readonly code: 'EMAIL_TAKEN' | 'USER_NOT_FOUND' | 'LAST_ADMIN',
  ) {
    super(message);
    this.name = 'UserServiceError';
  }
}

function toUserDto(row: typeof users.$inferSelect): UserDto {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    last_login: row.lastLoginAt,
  };
}

export class UserService {
  constructor(private readonly db: Database) {}

  async list(query: UserListQueryDto) {
    const filters: SQL[] = [];

    if (query.search) {
      const term = `%${query.search}%`;
      filters.push(or(ilike(users.name, term), ilike(users.email, term))!);
    }
    if (query.role) filters.push(eq(users.role, query.role));
    if (query.status) filters.push(eq(users.status, query.status));

    const whereClause = filters.length > 0 ? and(...filters) : undefined;
    const offset = (query.page - 1) * query.limit;

    const [rows, countRows] = await Promise.all([
      this.db
        .select()
        .from(users)
        .where(whereClause)
        .orderBy(desc(users.createdAt))
        .limit(query.limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(whereClause),
    ]);

    return {
      items: rows.map(toUserDto),
      meta: {
        page: query.page,
        limit: query.limit,
        total: countRows[0]?.count ?? 0,
        total_pages: Math.max(1, Math.ceil((countRows[0]?.count ?? 0) / query.limit)),
      },
    };
  }

  async create(input: CreateUserRequestDto): Promise<UserDto> {
    const email = input.email.trim().toLowerCase();
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new UserServiceError('Email already in use', 'EMAIL_TAKEN');
    }

    const [created] = await this.db
      .insert(users)
      .values({
        name: input.name.trim(),
        email,
        passwordHash: await hashPassword(input.password),
        role: input.role,
        status: input.status ?? 'active',
      })
      .returning();

    if (!created) {
      throw new Error('Failed to create user');
    }

    return toUserDto(created);
  }

  async update(id: string, input: UpdateUserRequestDto): Promise<UserDto> {
    const current = await this.findById(id);
    if (!current) {
      throw new UserServiceError('User not found', 'USER_NOT_FOUND');
    }

    const nextRole = input.role ?? current.role;
    const nextStatus = input.status ?? current.status;
    if (
      current.role === 'admin' &&
      (nextRole !== 'admin' || nextStatus !== 'active')
    ) {
      await this.assertNotLastAdmin(id);
    }

    let email = current.email;
    if (input.email) {
      email = input.email.trim().toLowerCase();
      if (email !== current.email) {
        const existing = await this.findByEmail(email);
        if (existing && existing.id !== id) {
          throw new UserServiceError('Email already in use', 'EMAIL_TAKEN');
        }
      }
    }

    const [updated] = await this.db
      .update(users)
      .set({
        name: input.name?.trim() ?? current.name,
        email,
        role: nextRole,
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, id))
      .returning();

    if (!updated) {
      throw new UserServiceError('User not found', 'USER_NOT_FOUND');
    }

    return toUserDto(updated);
  }

  async delete(id: string): Promise<void> {
    const current = await this.findById(id);
    if (!current) {
      throw new UserServiceError('User not found', 'USER_NOT_FOUND');
    }

    if (current.role === 'admin') {
      await this.assertNotLastAdmin(id);
    }

    await this.db.delete(users).where(eq(users.id, id));
  }

  private async findById(id: string) {
    const [row] = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return row ?? null;
  }

  private async findByEmail(email: string) {
    const [row] = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return row ?? null;
  }

  private async assertNotLastAdmin(userId: string) {
    const [countRow] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(and(eq(users.role, 'admin'), eq(users.status, 'active')));

    if ((countRow?.count ?? 0) <= 1) {
      const [target] = await this.db
        .select({ id: users.id, role: users.role })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (target?.role === 'admin') {
        throw new UserServiceError('Cannot remove the last admin', 'LAST_ADMIN');
      }
    }
  }
}
