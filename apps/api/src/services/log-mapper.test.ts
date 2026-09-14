import { describe, expect, it } from 'vitest';
import { mapDeliveryToLog } from './log-mapper.js';

describe('mapDeliveryToLog', () => {
  it('maps succeeded shipment_attributes to a Pre-Transportation success log', () => {
    const log = mapDeliveryToLog({
      delivery: {
        id: '00000000-0000-4000-8000-000000000101',
        operation: 'shipment_attributes',
        status: 'succeeded',
        httpStatus: 201,
        attempts: 1,
        payload: {},
        response: { mode: 'seed', status: 'succeeded' },
        createdAt: '2026-07-10T14:30:00.000Z',
        updatedAt: '2026-07-10T14:30:00.000Z',
      },
      shipment: {
        id: '00000000-0000-4000-8000-000000000010',
        reference: 'QA-D2D-FCL-SYNCED',
        bol: 'MAEU123456789',
        hbol: 'MAEU-HBL-123456',
        carrier: 'Maersk Line',
        vessel: 'MSC ISABELLA',
        voyage: '024E',
        movementType: 'D2D',
        pol: 'Shanghai, CN',
        pod: 'Los Angeles, US',
        eta: '2026-09-20',
      },
      container: { container: 'MSKU1234567', containerType: '42GP' },
    });

    expect(log.type).toBe('Pre-Transportation');
    expect(log.endpoint).toBe('/dsm/v1/data/ent/shipments');
    expect(log.status).toBe('Success');
    expect(log.code).toBe(201);
    expect(log.shipment).toBe('QA-D2D-FCL-SYNCED');
    expect(log.request).toMatchObject({
      customerReferenceNumber: 'QA-D2D-FCL-SYNCED',
      bol: 'MAEU123456789',
      hbol: 'MAEU-HBL-123456',
      movementType: 'D2D',
      containerType: '42GP',
      carrierEta: '2026-09-20',
    });
  });

  it('maps failed shipment_event to a During Transportation failed log', () => {
    const log = mapDeliveryToLog({
      delivery: {
        id: '00000000-0000-4000-8000-000000000102',
        operation: 'shipment_event',
        status: 'failed',
        httpStatus: 400,
        attempts: 2,
        payload: {},
        response: { error: 'Invalid event data' },
        createdAt: '2026-07-10T14:30:00.000Z',
        updatedAt: '2026-07-10T14:31:00.000Z',
      },
      shipment: {
        id: '00000000-0000-4000-8000-000000000010',
        reference: 'QA-D2D-FCL-SYNCED',
        bol: 'MAEU123456789',
        hbol: 'MAEU-HBL-123456',
        carrier: 'Maersk Line',
        vessel: 'MSC ISABELLA',
        voyage: '024E',
        movementType: 'D2D',
        pol: 'Shanghai, CN',
        pod: 'Los Angeles, US',
        eta: '2026-09-20',
      },
      milestone: {
        name: 'Booking Confirmation',
        dateTime: '2026-07-10T14:30:00.000Z',
        location: 'Shanghai, CN',
      },
    });

    expect(log.type).toBe('During Transportation');
    expect(log.endpoint).toBe('/dsm/v1/data/eco/shipments/events');
    expect(log.status).toBe('Failed');
    expect(log.code).toBe(400);
    expect(log.retry).toBe(2);
    expect(log.request).toMatchObject({
      trackingNumber: 'QA-D2D-FCL-SYNCED',
      description: 'Booking Confirmation',
    });
  });
});
