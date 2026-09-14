import { desc, inArray } from 'drizzle-orm';
import type { LogListQueryDto, TransvoyantLogDto } from '@lpi/contracts';
import type { Database } from '@lpi/database';
import { integrationDeliveries, milestones, shipmentContainers, shipments } from '@lpi/database';
import { mapDeliveryToLog } from './log-mapper.js';

export class LogService {
  constructor(private readonly db: Database) {}

  async list(query: LogListQueryDto): Promise<{
    items: TransvoyantLogDto[];
    meta: { page: number; limit: number; total: number; total_pages: number };
  }> {
    const deliveries = await this.db
      .select()
      .from(integrationDeliveries)
      .orderBy(desc(integrationDeliveries.updatedAt));

    const shipmentIds = [...new Set(deliveries.map((row) => row.shipmentId))];
    const milestoneIds = [
      ...new Set(
        deliveries
          .map((row) => row.milestoneId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    const [shipmentRows, containerRows, milestoneRows] = await Promise.all([
      shipmentIds.length
        ? this.db.select().from(shipments).where(inArray(shipments.id, shipmentIds))
        : Promise.resolve([]),
      shipmentIds.length
        ? this.db
            .select()
            .from(shipmentContainers)
            .where(inArray(shipmentContainers.shipmentId, shipmentIds))
        : Promise.resolve([]),
      milestoneIds.length
        ? this.db.select().from(milestones).where(inArray(milestones.id, milestoneIds))
        : Promise.resolve([]),
    ]);

    const shipmentById = new Map(shipmentRows.map((row) => [row.id, row]));
    const containerByShipmentId = new Map(
      containerRows.map((row) => [row.shipmentId, row]),
    );
    const milestoneById = new Map(milestoneRows.map((row) => [row.id, row]));

    const items = deliveries
      .map((delivery) => {
        const shipment = shipmentById.get(delivery.shipmentId);
        if (!shipment) return null;
        const milestone = delivery.milestoneId
          ? milestoneById.get(delivery.milestoneId)
          : undefined;
        return mapDeliveryToLog({
          delivery: {
            id: delivery.id,
            operation: delivery.operation,
            status: delivery.status,
            httpStatus: delivery.httpStatus,
            attempts: delivery.attempts,
            payload: delivery.payload,
            response: delivery.response,
            createdAt: delivery.createdAt,
            updatedAt: delivery.updatedAt,
          },
          shipment: {
            id: shipment.id,
            reference: shipment.reference,
            bol: shipment.bol,
            hbol: shipment.hbol,
            carrier: shipment.carrier,
            vessel: shipment.vessel,
            voyage: shipment.voyage,
            movementType: shipment.movementType,
            pol: shipment.pol,
            pod: shipment.pod,
            eta: shipment.eta,
          },
          container: containerByShipmentId.get(shipment.id) ?? null,
          milestone: milestone
            ? {
                name: milestone.name,
                dateTime: milestone.dateTime,
                location: milestone.location,
              }
            : null,
        });
      })
      .filter((log): log is TransvoyantLogDto => log !== null)
      .filter((log) => {
        if (query.search && !log.shipment.toLowerCase().includes(query.search.toLowerCase())) {
          return false;
        }
        if (query.status && log.status !== query.status) return false;
        if (query.type && log.type !== query.type) return false;
        return true;
      });

    const total = items.length;
    const offset = (query.page - 1) * query.limit;
    const paged = items.slice(offset, offset + query.limit);

    return {
      items: paged,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        total_pages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  }
}
