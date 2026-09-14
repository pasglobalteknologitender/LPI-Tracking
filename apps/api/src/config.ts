import { randomBytes, createHash } from 'node:crypto';

const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

export const config = {
  port: Number(process.env.API_PORT ?? 3001),
  host: process.env.API_HOST ?? '0.0.0.0',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret-change-me-min-32-chars',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-change-me-min-32-chars',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  appOrigin: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3100',
  accessTtlSeconds: ACCESS_TTL_SECONDS,
  refreshTtlSeconds: REFRESH_TTL_SECONDS,
};

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateRefreshToken(): string {
  return randomBytes(48).toString('base64url');
}
