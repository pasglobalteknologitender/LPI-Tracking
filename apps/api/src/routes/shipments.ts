import type { FastifyInstance } from 'fastify';
import { shipmentListQuerySchema, updateMilestoneRequestSchema } from '@lpi/contracts';
import { authenticate, requirePermission, validateMutationOrigin } from '../plugins/auth.js';
import { ShipmentService } from '../services/shipment.service.js';

export async function shipmentRoutes(app: FastifyInstance) {
  const shipmentService = new ShipmentService(app.db);

  app.get(
    '/api/v1/shipments',
    { preHandler: requirePermission('view_shipments') },
    async (request, reply) => {
      const parsed = shipmentListQuerySchema.safeParse(request.query);
      if (!parsed.success) {
        return reply.status(422).send({
          success: false,
          message: 'Validation error',
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const result = await shipmentService.list(parsed.data);
      return reply.send({
        success: true,
        message: 'OK',
        data: result.items,
        meta: result.meta,
      });
    },
  );

  app.get(
    '/api/v1/shipments/:shipmentId',
    { preHandler: requirePermission('view_shipments') },
    async (request, reply) => {
      const { shipmentId } = request.params as { shipmentId: string };
      const shipment = await shipmentService.getById(shipmentId);

      if (!shipment) {
        return reply.status(404).send({
          success: false,
          message: 'Shipment not found',
        });
      }

      return reply.send({
        success: true,
        message: 'OK',
        data: shipment,
      });
    },
  );

  app.patch(
    '/api/v1/shipments/:shipmentId/milestones/:milestoneId',
    { preHandler: requirePermission('update_milestone') },
    async (request, reply) => {
      validateMutationOrigin(request, reply);
      if (reply.sent) return;

      const { shipmentId, milestoneId } = request.params as {
        shipmentId: string;
        milestoneId: string;
      };

      const parsed = updateMilestoneRequestSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(422).send({
          success: false,
          message: 'Validation error',
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const milestone = await shipmentService.updateMilestone(
        shipmentId,
        milestoneId,
        parsed.data,
        request.user!.id,
      );

      if (!milestone) {
        return reply.status(404).send({
          success: false,
          message: 'Milestone not found',
        });
      }

      return reply.send({
        success: true,
        message: 'Milestone updated',
        data: milestone,
      });
    },
  );
}
