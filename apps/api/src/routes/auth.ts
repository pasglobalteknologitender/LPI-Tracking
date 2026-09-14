import type { FastifyInstance } from 'fastify';
import { loginRequestSchema } from '@lpi/contracts';
import { AuthService } from '../services/auth.service.js';
import {
  clearAuthCookies,
  REFRESH_COOKIE,
  setAuthCookies,
} from '../lib/cookies.js';
import { authenticate, validateMutationOrigin } from '../plugins/auth.js';

export async function authRoutes(app: FastifyInstance) {
  const authService = new AuthService(app.db);

  app.post('/api/v1/auth/login', async (request, reply) => {
    validateMutationOrigin(request, reply);
    if (reply.sent) return;

    const parsed = loginRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(422).send({
        success: false,
        message: 'Validation error',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    try {
      const result = await authService.login(parsed.data.email, parsed.data.password);
      setAuthCookies(reply, result.accessToken, result.refreshToken);

      return reply.send({
        success: true,
        message: 'Login successful',
        data: {
          access_token: result.accessToken,
          token_type: 'Bearer',
          expires_in: result.expiresIn,
          user: result.user,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
        return reply.status(401).send({
          success: false,
          message: 'Invalid email or password',
        });
      }
      throw error;
    }
  });

  app.get('/api/v1/auth/me', { preHandler: authenticate }, async (request, reply) => {
    try {
      const user = await authService.getMe(request.user!.id);
      return reply.send({
        success: true,
        message: 'OK',
        data: user,
      });
    } catch {
      return reply.status(401).send({
        success: false,
        message: 'Unauthorized',
      });
    }
  });

  app.post('/api/v1/auth/refresh', async (request, reply) => {
    validateMutationOrigin(request, reply);
    if (reply.sent) return;

    const refreshToken = request.cookies[REFRESH_COOKIE];
    if (!refreshToken) {
      return reply.status(401).send({
        success: false,
        message: 'Refresh token missing',
      });
    }

    try {
      const result = await authService.refresh(refreshToken);
      setAuthCookies(reply, result.accessToken, result.refreshToken);

      return reply.send({
        success: true,
        message: 'Token refreshed',
        data: {
          access_token: result.accessToken,
          token_type: 'Bearer',
          expires_in: result.expiresIn,
          user: result.user,
        },
      });
    } catch {
      clearAuthCookies(reply);
      return reply.status(401).send({
        success: false,
        message: 'Invalid refresh token',
      });
    }
  });

  app.post('/api/v1/auth/logout', async (request, reply) => {
    validateMutationOrigin(request, reply);
    if (reply.sent) return;

    await authService.logout(request.cookies[REFRESH_COOKIE]);
    clearAuthCookies(reply);

    return reply.send({
      success: true,
      message: 'Logged out',
      data: null,
    });
  });
}
