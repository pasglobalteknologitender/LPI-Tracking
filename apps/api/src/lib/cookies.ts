import type { FastifyReply } from 'fastify';
import { config } from '../config.js';

export const ACCESS_COOKIE = 'lpi_access_token';
export const REFRESH_COOKIE = 'lpi_refresh_token';

const cookieBase = {
  httpOnly: true,
  secure: config.cookieSecure,
  sameSite: 'lax' as const,
  path: '/',
};

export function setAuthCookies(
  reply: FastifyReply,
  accessToken: string,
  refreshToken: string,
) {
  reply.setCookie(ACCESS_COOKIE, accessToken, {
    ...cookieBase,
    maxAge: config.accessTtlSeconds,
  });
  reply.setCookie(REFRESH_COOKIE, refreshToken, {
    ...cookieBase,
    maxAge: config.refreshTtlSeconds,
  });
}

export function clearAuthCookies(reply: FastifyReply) {
  reply.clearCookie(ACCESS_COOKIE, cookieBase);
  reply.clearCookie(REFRESH_COOKIE, cookieBase);
}
