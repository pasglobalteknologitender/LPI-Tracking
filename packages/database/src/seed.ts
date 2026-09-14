import { hash } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import { MILESTONE_NAMES } from '@lpi/contracts';
import { createDb } from './index.js';
import {
  integrationDeliveries,
  milestones,
  shipmentContainers,
  shipments,
  users,
} from './schema/index.js';
import {
  SEED_IDS,
  SEED_PASSWORDS,
  SEED_SHIPMENTS,
  SEED_TIMESTAMPS,
} from './seed-data.js';

async function main() {
  const db = createDb();

  const passwordHashes = {
    admin: await hash(SEED_PASSWORDS.admin, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    }),
    operator: await hash(SEED_PASSWORDS.operator, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    }),
    viewer: await hash(SEED_PASSWORDS.viewer, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    }),
  };

  await db.transaction(async (tx) => {
    const seedUsers = [
      {
        id: SEED_IDS.adminUser,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin' as const,
        passwordHash: passwordHashes.admin,
        lastLoginAt: SEED_TIMESTAMPS.adminLastLogin,
      },
      {
        id: SEED_IDS.operatorUser,
        name: 'Operator User',
        email: 'operator@example.com',
        role: 'operator' as const,
        passwordHash: passwordHashes.operator,
      },
      {
        id: SEED_IDS.viewerUser,
        name: 'Viewer User',
        email: 'viewer@example.com',
        role: 'viewer' as const,
        passwordHash: passwordHashes.viewer,
      },
    ];

    for (const seedUser of seedUsers) {
      const existing = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, seedUser.id))
        .limit(1);

      if (existing.length === 0) {
        await tx.insert(users).values({
          id: seedUser.id,
          name: seedUser.name,
          email: seedUser.email,
          passwordHash: seedUser.passwordHash,
          role: seedUser.role,
          status: 'active',
          lastLoginAt: seedUser.lastLoginAt,
        });
      }
    }

    for (const seedShipment of SEED_SHIPMENTS) {
      const existing = await tx
        .select({ id: shipments.id })
        .from(shipments)
        .where(eq(shipments.id, seedShipment.id))
        .limit(1);

      if (existing.length > 0) continue;

      await tx.insert(shipments).values({
        id: seedShipment.id,
        reference: seedShipment.reference,
        bol: seedShipment.bol,
        hbol: seedShipment.hbol,
        carrier: seedShipment.carrier,
        vessel: seedShipment.vessel,
        voyage: seedShipment.voyage,
        movementType: seedShipment.movementType,
        status: seedShipment.status,
        shipper: seedShipment.shipper,
        consignee: seedShipment.consignee,
        pol: seedShipment.pol,
        pod: seedShipment.pod,
        etd: seedShipment.etd,
        eta: seedShipment.eta,
        cargoType: seedShipment.cargoType,
        containerSize: seedShipment.containerSize,
        weight: seedShipment.weight,
      });

      if (seedShipment.container) {
        await tx.insert(shipmentContainers).values({
          shipmentId: seedShipment.id,
          reference: seedShipment.reference,
          container: seedShipment.container,
          containerType: seedShipment.containerType,
        });
      }

      for (const [index, name] of MILESTONE_NAMES.entries()) {
        const isDone = index < seedShipment.completedMilestones;
        await tx.insert(milestones).values({
          shipmentId: seedShipment.id,
          name,
          status: isDone ? 'done' : 'pending',
          dateTime: isDone ? SEED_TIMESTAMPS.milestoneDateTime : null,
          location: isDone ? 'Shanghai, CN' : null,
          notes: isDone ? 'Completed successfully' : null,
          lastUpdatedAt: isDone ? SEED_TIMESTAMPS.milestoneDateTime : null,
          updatedById: isDone ? SEED_IDS.adminUser : null,
        });
      }

      await tx.insert(integrationDeliveries).values({
        shipmentId: seedShipment.id,
        operation: 'shipment_attributes',
        status:
          seedShipment.syncStatus === 'synced'
            ? 'succeeded'
            : seedShipment.syncStatus === 'failed'
              ? 'failed'
              : 'pending',
        attempts: seedShipment.syncStatus === 'failed' ? 5 : 1,
        idempotencyKey: `seed:${seedShipment.id}:attributes:1`,
        payload: { reference: seedShipment.reference },
        response:
          seedShipment.syncStatus === 'synced'
            ? { mode: 'seed', status: 'succeeded' }
            : seedShipment.syncStatus === 'failed'
              ? { mode: 'seed', status: 'failed' }
              : null,
        errorMessage:
          seedShipment.syncStatus === 'failed'
            ? 'Seed delivery failed for testing'
            : null,
        httpStatus: seedShipment.syncStatus === 'synced' ? 201 : seedShipment.syncStatus === 'failed' ? 403 : null,
      });
    }
  });

  console.log('Seed completed');
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
