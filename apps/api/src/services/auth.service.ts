import { verify } from '@node-rs/argon2';
import { and, eq, gt, isNull } from 'drizzle-orm';
import type { Database } from '@lpi/database';
import { refreshSessions, users } from '@lpi/database';
import {
  config,
  generateRefreshToken,
  hashToken,
} from '../config.js';
import { signAccessToken } from '../lib/jwt.js';

export class AuthService {
  constructor(private readonly db: Database) {}

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!user || user.status !== 'active') {
      throw new Error('INVALID_CREDENTIALS');
    }

    const validPassword = await verify(user.passwordHash, password);
    if (!validPassword) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + config.refreshTtlSeconds * 1000).toISOString();

    await this.db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ lastLoginAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
        .where(eq(users.id, user.id));

      await tx.insert(refreshSessions).values({
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt,
      });
    });

    const accessToken = await signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: config.accessTtlSeconds,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getMe(userId: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || user.status !== 'active') {
      throw new Error('UNAUTHORIZED');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      last_login: user.lastLoginAt,
    };
  }

  async refresh(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    const now = new Date().toISOString();

    const [session] = await this.db
      .select()
      .from(refreshSessions)
      .where(
        and(
          eq(refreshSessions.tokenHash, tokenHash),
          isNull(refreshSessions.revokedAt),
          gt(refreshSessions.expiresAt, now),
        ),
      )
      .limit(1);

    if (!session) {
      throw new Error('INVALID_REFRESH');
    }

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user || user.status !== 'active') {
      throw new Error('UNAUTHORIZED');
    }

    const nextRefreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + config.refreshTtlSeconds * 1000).toISOString();

    await this.db.transaction(async (tx) => {
      await tx
        .update(refreshSessions)
        .set({ revokedAt: now })
        .where(eq(refreshSessions.id, session.id));

      await tx.insert(refreshSessions).values({
        userId: user.id,
        tokenHash: hashToken(nextRefreshToken),
        expiresAt,
      });
    });

    const accessToken = await signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      refreshToken: nextRefreshToken,
      expiresIn: config.accessTtlSeconds,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async logout(refreshToken: string | undefined) {
    if (!refreshToken) return;

    await this.db
      .update(refreshSessions)
      .set({ revokedAt: new Date().toISOString() })
      .where(eq(refreshSessions.tokenHash, hashToken(refreshToken)));
  }
}
