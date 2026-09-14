import type { FastifyInstance } from 'fastify';
import { logListQuerySchema } from '@lpi/contracts';
import { requirePermission } from '../plugins/auth.js';
import { LogService } from '../services/log.service.js';

export async function logRoutes(app: FastifyInstance) {
  const logService = new LogService(app.db);

  app.get(
    '/api/v1/logs',
    { preHandler: requirePermission('view_logs') },
    async (request, reply) => {
      const parsed = logListQuerySchema.safeParse(request.query);
      if (!parsed.success) {
        return reply.status(422).send({
          success: false,
          message: 'Validation error',
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const result = await logService.list(parsed.data);
      return reply.send({
        success: true,
        message: 'OK',
        data: result.items,
        meta: result.meta,
      });
    },
  );
}
