import { describe, expect, it } from 'vitest';
import { mapShipmentListItemFromDto, mapShipmentListItemToDto } from './shipment';

describe('shipment mapper', () => {
  it('round-trips snake_case DTO to camelCase domain', () => {
    const dto = {
      id: '00000000-0000-4000-8000-000000000010',
      reference: 'SEA-2024-001234',
      bol: 'MAEU123456789',
      hbol: 'MAEU-HBL-123456',
      container: 'MSKU1234567',
      container_type: '42GP',
      carrier: 'Maersk Line',
      vessel: 'MSC ISABELLA',
      voyage: '024E',
      movement_type: 'D2D' as const,
      status: 'Departed' as const,
      shipper: 'Shanghai Electronics Co.',
      consignee: 'US Imports LLC',
      pol: 'Shanghai, CN',
      pod: 'Los Angeles, US',
      etd: '2024-03-15',
      eta: '2024-04-10',
      cargo_type: 'FCL' as const,
      container_size: "40'",
      weight: '18,500 kg',
      sync_status: 'synced' as const,
    };

    const domain = mapShipmentListItemFromDto(dto);
    expect(domain.containerType).toBe('42GP');
    expect(domain.movementType).toBe('D2D');
    expect(mapShipmentListItemToDto(domain)).toEqual(dto);
  });
});
