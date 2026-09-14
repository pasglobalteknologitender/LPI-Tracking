import type { FastifyReply, FastifyRequest } from 'fastify';
import { hasPermission, type Permission, type UserRole } from '@lpi/contracts';
import { verifyAccessToken } from '../lib/jwt.js';
import { ACCESS_COOKIE } from '../lib/cookies.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

function extractAccessToken(request: FastifyRequest): string | undefined {
  const authorization = request.headers.authorization;
  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length);
  }

  const cookieToken = request.cookies[ACCESS_COOKIE];
  return typeof cookieToken === 'string' ? cookieToken : undefined;
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const token = extractAccessToken(request);
  if (!token) {
    return reply.status(401).send({
      success: false,
      message: 'Unauthorized',
    });
  }

  try {
    const payload = await verifyAccessToken(token);
    request.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role as UserRole,
    };
  } catch {
    return reply.status(401).send({
      success: false,
      message: 'Unauthorized',
    });
  }
}

export function requirePermission(permission: Permission) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply);
    if (reply.sent) return;

    const role = request.user?.role;
    if (!role || !hasPermission(role, permission)) {
      return reply.status(403).send({
        success: false,
        message: 'Forbidden',
      });
    }
  };
}

export function validateMutationOrigin(request: FastifyRequest, reply: FastifyReply) {
  const origin = request.headers.origin;
  const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3100';

  if (origin && origin !== allowedOrigin) {
    return reply.status(403).send({
      success: false,
      message: 'Origin not allowed',
    });
  }
}
