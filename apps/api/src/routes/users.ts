import type { FastifyInstance, FastifyReply } from 'fastify';
import { createUserRequestSchema, updateUserRequestSchema, userListQuerySchema } from '@lpi/contracts';
import { requirePermission, validateMutationOrigin } from '../plugins/auth.js';
import { UserService, UserServiceError } from '../services/user.service.js';

function sendUserError(error: unknown, reply: FastifyReply) {
  if (error instanceof UserServiceError) {
    const status =
      error.code === 'USER_NOT_FOUND' ? 404 : error.code === 'EMAIL_TAKEN' ? 409 : 422;
    return reply.status(status).send({
      success: false,
      message: error.message,
    });
  }
  throw error;
}

export async function userRoutes(app: FastifyInstance) {
  const userService = new UserService(app.db);

  app.get(
    '/api/v1/users',
    { preHandler: requirePermission('manage_users') },
    async (request, reply) => {
      const parsed = userListQuerySchema.safeParse(request.query);
      if (!parsed.success) {
        return reply.status(422).send({
          success: false,
          message: 'Validation error',
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const result = await userService.list(parsed.data);
      return reply.send({
        success: true,
        message: 'OK',
        data: result.items,
        meta: result.meta,
      });
    },
  );

  app.post(
    '/api/v1/users',
    { preHandler: requirePermission('manage_users') },
    async (request, reply) => {
      validateMutationOrigin(request, reply);
      if (reply.sent) return;

      const parsed = createUserRequestSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(422).send({
          success: false,
          message: 'Validation error',
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      try {
        const user = await userService.create(parsed.data);
        return reply.status(201).send({
          success: true,
          message: 'User created',
          data: user,
        });
      } catch (error) {
        return sendUserError(error, reply);
      }
    },
  );

  app.patch(
    '/api/v1/users/:userId',
    { preHandler: requirePermission('manage_users') },
    async (request, reply) => {
      validateMutationOrigin(request, reply);
      if (reply.sent) return;

      const { userId } = request.params as { userId: string };
      const parsed = updateUserRequestSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(422).send({
          success: false,
          message: 'Validation error',
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      try {
        const user = await userService.update(userId, parsed.data);
        return reply.send({
          success: true,
          message: 'User updated',
          data: user,
        });
      } catch (error) {
        return sendUserError(error, reply);
      }
    },
  );

  app.delete(
    '/api/v1/users/:userId',
    { preHandler: requirePermission('manage_users') },
    async (request, reply) => {
      validateMutationOrigin(request, reply);
      if (reply.sent) return;

      const { userId } = request.params as { userId: string };
      try {
        await userService.delete(userId);
        return reply.send({
          success: true,
          message: 'User deleted',
          data: null,
        });
      } catch (error) {
        return sendUserError(error, reply);
      }
    },
  );
}
