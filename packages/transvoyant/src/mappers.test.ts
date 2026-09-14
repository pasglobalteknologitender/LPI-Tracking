import { describe, expect, it } from 'vitest';
import {
  classifyRetryableStatus,
  mapDeliveryStatusToSyncStatus,
  mapShipmentAttributes,
} from './mappers.js';

describe('transvoyant mappers', () => {
  it('maps shipment attributes to vendor payload', () => {
    expect(
      mapShipmentAttributes({
        reference: 'SEA-001',
        carrier: 'Maersk',
        carrierScac: 'MAEU',
        hbol: 'HBL-1',
        containerType: '42GP',
      }),
    ).toEqual({
      customerReferenceNumber: 'SEA-001',
      carrier: 'Maersk',
      carrierSCAC: 'MAEU',
      houseAwb: 'HBL-1',
      containerType: '42GP',
    });
  });

  it('maps delivery status to UI sync status', () => {
    expect(mapDeliveryStatusToSyncStatus('succeeded')).toBe('synced');
    expect(mapDeliveryStatusToSyncStatus('retry_scheduled')).toBe('syncing');
    expect(mapDeliveryStatusToSyncStatus('dead')).toBe('failed');
    expect(mapDeliveryStatusToSyncStatus(undefined)).toBe('unsynced');
  });

  it('classifies retryable HTTP statuses', () => {
    expect(classifyRetryableStatus(401)).toBe('refresh');
    expect(classifyRetryableStatus(429)).toBe('retry');
    expect(classifyRetryableStatus(500)).toBe('retry');
    expect(classifyRetryableStatus(403)).toBe('terminal');
  });
});
