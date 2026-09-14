import type { IntegrationDeliveryStatus, SyncStatus } from '@lpi/contracts';

export interface ShipmentAttributeSource {
  reference: string;
  carrier?: string | null;
  carrierScac?: string | null;
  bol?: string | null;
  hbol?: string | null;
  vessel?: string | null;
  voyage?: string | null;
  pol?: string | null;
  pod?: string | null;
  container?: string | null;
  containerType?: string | null;
}

export function mapShipmentAttributes(source: ShipmentAttributeSource) {
  return {
    customerReferenceNumber: source.reference,
    carrier: source.carrier ?? undefined,
    carrierSCAC: source.carrierScac ?? undefined,
    bol: source.bol ?? undefined,
    houseAwb: source.hbol ?? undefined,
    vesselName: source.vessel ?? undefined,
    voyage: source.voyage ?? undefined,
    pol: source.pol ?? undefined,
    pod: source.pod ?? undefined,
    container: source.container ?? undefined,
    containerType: source.containerType ?? undefined,
  };
}

export function mapDeliveryStatusToSyncStatus(
  status: IntegrationDeliveryStatus | null | undefined,
): SyncStatus {
  switch (status) {
    case 'succeeded':
      return 'synced';
    case 'processing':
    case 'pending':
    case 'retry_scheduled':
      return 'syncing';
    case 'failed':
    case 'dead':
      return 'failed';
    default:
      return 'unsynced';
  }
}

export function buildIdempotencyKey(parts: Array<string | number | null | undefined>): string {
  return parts.filter((part) => part !== null && part !== undefined).join(':');
}

export const RETRY_BACKOFF_MS = [
  60_000,
  5 * 60_000,
  30 * 60_000,
  2 * 60 * 60_000,
] as const;

export function classifyRetryableStatus(status: number): 'retry' | 'terminal' | 'refresh' {
  if (status === 401) return 'refresh';
  if (status === 429 || status >= 500) return 'retry';
  if (status === 400 || status === 403) return 'terminal';
  return 'terminal';
}

export function isSuccessfulTransVoyantStatus(status: number): boolean {
  return status >= 200 && status < 300;
}
