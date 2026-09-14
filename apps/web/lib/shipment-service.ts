import {
  fetchShipmentById,
  fetchShipments,
  patchMilestoneRequest,
} from './api';
import type { Milestone, Shipment } from './types';

export type UpdateMilestoneInput = {
  shipmentId: string;
  milestone: Milestone;
};

export async function getShipments(): Promise<Shipment[]> {
  return fetchShipments();
}

export async function getShipmentById(id: string): Promise<Shipment | null> {
  return fetchShipmentById(id);
}

export async function updateMilestone({
  shipmentId,
  milestone,
}: UpdateMilestoneInput): Promise<Shipment | null> {
  await patchMilestoneRequest(shipmentId, milestone.id, milestone);
  return getShipmentById(shipmentId);
}

export async function updateShipmentSyncState(
  _shipmentId: string,
  _syncState: Pick<Shipment, 'isSynced' | 'syncedAt' | 'syncStatus' | 'syncError'>,
): Promise<Shipment | null> {
  throw new Error('Sync state updates are not available until integration sync API is implemented');
}

export async function markShipmentMilestonesSynced(_shipmentId: string): Promise<Shipment | null> {
  throw new Error('Manual sync is not available until integration sync API is implemented');
}

export async function markShipmentMilestonesUnsynced(_shipmentId: string): Promise<Shipment | null> {
  throw new Error('Manual sync is not available until integration sync API is implemented');
}
