import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import type { ShipmentListQueryDto, UpdateMilestoneRequestDto } from '@lpi/contracts';
import type { Database } from '@lpi/database';
import {
  integrationDeliveries,
  milestones,
  shipmentContainers,
  shipments,
  users,
} from '@lpi/database';
import { mapDeliveryStatusToSyncStatus } from '@lpi/transvoyant';

type ContainerRow = typeof shipmentContainers.$inferSelect;
type ShipmentRow = typeof shipments.$inferSelect;

/**
 * Normalize a database timestamp to a strict ISO 8601 string with offset.
 * Postgres `timestamp({ mode: 'string' })` returns values like
 * `2026-07-10 14:30:00+00`, which fails the client's `datetime({ offset: true })`
 * validation when echoed back on edit. Returns null for empty/invalid values.
 */
function toIso(value: string | null | undefined): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export class ShipmentService {
  constructor(private readonly db: Database) {}

  async list(query: ShipmentListQueryDto) {
    const filters: SQL[] = [];

    if (query.search) {
      const term = `%${query.search}%`;
      filters.push(
        or(
          ilike(shipments.reference, term),
          ilike(shipments.bol, term),
          ilike(shipments.shipper, term),
          ilike(shipments.consignee, term),
          sql`exists (
            select 1 from ${shipmentContainers}
            where ${shipmentContainers.shipmentId} = ${shipments.id}
            and ${shipmentContainers.container} ilike ${term}
          )`,
        )!,
      );
    }

    if (query.status) filters.push(eq(shipments.status, query.status));
    if (query.movement_type) filters.push(eq(shipments.movementType, query.movement_type));
    if (query.pol) filters.push(ilike(shipments.pol, `%${query.pol}%`));
    if (query.pod) filters.push(ilike(shipments.pod, `%${query.pod}%`));

    const whereClause = filters.length > 0 ? and(...filters) : undefined;
    const offset = (query.page - 1) * query.limit;

    const [rows, countRows] = await Promise.all([
      this.db
        .select()
        .from(shipments)
        .where(whereClause)
        .orderBy(desc(shipments.createdAt))
        .limit(query.limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(shipments)
        .where(whereClause),
    ]);

    const shipmentIds = rows.map((row) => row.id);
    const containers = shipmentIds.length
      ? await this.db
          .select()
          .from(shipmentContainers)
          .where(inArray(shipmentContainers.shipmentId, shipmentIds))
      : [];

    const deliveries = shipmentIds.length
      ? await this.db
          .select()
          .from(integrationDeliveries)
          .where(inArray(integrationDeliveries.shipmentId, shipmentIds))
          .orderBy(desc(integrationDeliveries.createdAt))
      : [];

    const containerByShipment = new Map<string, ContainerRow>();
    for (const container of containers) {
      if (!containerByShipment.has(container.shipmentId)) {
        containerByShipment.set(container.shipmentId, container);
      }
    }

    const latestDeliveryByShipment = new Map<string, (typeof deliveries)[number]>();
    for (const delivery of deliveries) {
      if (!latestDeliveryByShipment.has(delivery.shipmentId)) {
        latestDeliveryByShipment.set(delivery.shipmentId, delivery);
      }
    }

    let items = rows.map((row) =>
      this.toListItem(
        row,
        containerByShipment.get(row.id),
        latestDeliveryByShipment.get(row.id),
      ),
    );

    if (query.sync_status) {
      items = items.filter((item) => item.sync_status === query.sync_status);
    }

    const total = countRows[0]?.count ?? 0;

    return {
      items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        total_pages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  }

  async getById(id: string) {
    const [row] = await this.db.select().from(shipments).where(eq(shipments.id, id)).limit(1);
    if (!row) return null;

    const [container] = await this.db
      .select()
      .from(shipmentContainers)
      .where(eq(shipmentContainers.shipmentId, id))
      .limit(1);

    const milestoneRows = await this.db
      .select({
        milestone: milestones,
        updatedByName: users.name,
      })
      .from(milestones)
      .leftJoin(users, eq(users.id, milestones.updatedById))
      .where(eq(milestones.shipmentId, id))
      .orderBy(asc(milestones.createdAt));

    const [latestDelivery] = await this.db
      .select()
      .from(integrationDeliveries)
      .where(eq(integrationDeliveries.shipmentId, id))
      .orderBy(desc(integrationDeliveries.createdAt))
      .limit(1);

    const sync = this.getSyncFields(latestDelivery);

    return {
      ...this.toListItem(row, container, latestDelivery),
      milestones: milestoneRows.map(({ milestone, updatedByName }) => ({
        id: milestone.id,
        name: milestone.name,
        status: milestone.status,
        date_time: toIso(milestone.dateTime),
        location: milestone.location,
        notes: milestone.notes,
        photo: milestone.photoFileId,
        last_updated: toIso(milestone.lastUpdatedAt),
        updated_by: updatedByName,
        is_synced: sync.sync_status === 'synced' && milestone.status === 'done',
        synced_at: sync.sync_status === 'synced' ? sync.synced_at : null,
        sync_status: sync.sync_status,
        sync_error: sync.sync_error,
      })),
      files: [],
    };
  }

  async updateMilestone(
    shipmentId: string,
    milestoneId: string,
    input: UpdateMilestoneRequestDto,
    actorUserId: string,
  ) {
    const [existing] = await this.db
      .select()
      .from(milestones)
      .where(and(eq(milestones.id, milestoneId), eq(milestones.shipmentId, shipmentId)))
      .limit(1);

    if (!existing) return null;

    const now = new Date().toISOString();

    await this.db
      .update(milestones)
      .set({
        status: input.status,
        dateTime: input.date_time ?? null,
        location: input.location ?? null,
        notes: input.notes ?? null,
        photoFileId: input.photo ?? null,
        lastUpdatedAt: now,
        updatedById: actorUserId,
        version: existing.version + 1,
        updatedAt: now,
      })
      .where(eq(milestones.id, milestoneId));

    const detail = await this.getById(shipmentId);
    if (!detail) return null;

    return detail.milestones.find((milestone) => milestone.id === milestoneId) ?? null;
  }

  private toListItem(
    row: ShipmentRow,
    container: ContainerRow | undefined,
    delivery: (typeof integrationDeliveries.$inferSelect) | undefined,
  ) {
    const sync = this.getSyncFields(delivery);

    return {
      id: row.id,
      reference: row.reference,
      bol: row.bol,
      hbol: row.hbol,
      container: container?.container ?? '',
      container_type: container?.containerType ?? '',
      carrier: row.carrier,
      vessel: row.vessel,
      voyage: row.voyage,
      movement_type: row.movementType,
      status: row.status,
      shipper: row.shipper,
      consignee: row.consignee,
      pol: row.pol,
      pod: row.pod,
      etd: row.etd,
      eta: row.eta,
      cargo_type: row.cargoType,
      container_size: row.containerSize,
      weight: row.weight,
      ...sync,
    };
  }

  private getSyncFields(
    delivery: (typeof integrationDeliveries.$inferSelect) | undefined,
  ) {
    const syncStatus = mapDeliveryStatusToSyncStatus(delivery?.status);
    return {
      is_synced: syncStatus === 'synced',
      synced_at: syncStatus === 'synced' ? delivery?.updatedAt ?? null : null,
      sync_status: syncStatus,
      sync_error: delivery?.errorMessage ?? null,
    };
  }
}
