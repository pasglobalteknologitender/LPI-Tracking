import type { TransvoyantLogDto } from '../api/integration';

export type IntegrationLog = {
  id: string;
  shipment: string;
  shipmentId: string;
  type: 'Pre-Transportation' | 'During Transportation';
  endpoint: string;
  status: 'Success' | 'Failed';
  code: number;
  retry: number;
  timestamp: string;
  request: Record<string, unknown>;
  response: Record<string, unknown> | null;
};

export function mapIntegrationLogFromDto(dto: TransvoyantLogDto): IntegrationLog {
  return {
    id: dto.id,
    shipment: dto.shipment,
    shipmentId: dto.shipment_id,
    type: dto.type,
    endpoint: dto.endpoint,
    status: dto.status,
    code: dto.code,
    retry: dto.retry,
    timestamp: dto.timestamp,
    request: dto.request,
    response: dto.response,
  };
}
