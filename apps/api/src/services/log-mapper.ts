import type { IntegrationDeliveryStatus, IntegrationOperation } from '@lpi/contracts';

export type LogDeliveryInput = {
  id: string;
  operation: IntegrationOperation;
  status: IntegrationDeliveryStatus;
  httpStatus: number | null;
  attempts: number;
  payload: unknown;
  response: unknown;
  createdAt: string;
  updatedAt: string;
};

export type LogShipmentInput = {
  id: string;
  reference: string;
  bol: string;
  hbol: string;
  carrier: string;
  vessel: string;
  voyage: string;
  movementType: string;
  pol: string;
  pod: string;
  eta: string;
};

export type LogContainerInput = {
  container: string;
  containerType: string;
};

export type LogMilestoneInput = {
  name: string;
  dateTime: string | null;
  location: string | null;
};

export type TransvoyantLog = {
  id: string;
  shipment: string;
  shipment_id: string;
  type: 'Pre-Transportation' | 'During Transportation';
  endpoint: string;
  status: 'Success' | 'Failed';
  code: number;
  retry: number;
  timestamp: string;
  request: Record<string, unknown>;
  response: Record<string, unknown> | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function isSuccessStatus(status: IntegrationDeliveryStatus): boolean {
  return status === 'succeeded';
}

export function mapDeliveryToLog(input: {
  delivery: LogDeliveryInput;
  shipment: LogShipmentInput;
  container?: LogContainerInput | null;
  milestone?: LogMilestoneInput | null;
}): TransvoyantLog {
  const isEvent = input.delivery.operation === 'shipment_event';
  const success = isSuccessStatus(input.delivery.status);
  const storedPayload = asRecord(input.delivery.payload);

  const request =
    storedPayload && Object.keys(storedPayload).some((key) => key !== 'reference')
      ? storedPayload
      : isEvent
        ? {
            trackingNumber: input.shipment.reference,
            description: input.milestone?.name ?? 'Shipment event',
            timestamp: input.milestone?.dateTime,
            location: input.milestone?.location,
          }
        : {
            customerReferenceNumber: input.shipment.reference,
            carrier: input.shipment.carrier,
            bol: input.shipment.bol,
            hbol: input.shipment.hbol,
            vesselName: input.shipment.vessel,
            voyage: input.shipment.voyage,
            movementType: input.shipment.movementType,
            pol: input.shipment.pol,
            pod: input.shipment.pod,
            container: input.container?.container ?? '',
            containerType: input.container?.containerType ?? '',
            carrierEta: input.shipment.eta,
          };

  return {
    id: input.delivery.id,
    shipment: input.shipment.reference,
    shipment_id: input.shipment.id,
    type: isEvent ? 'During Transportation' : 'Pre-Transportation',
    endpoint: isEvent
      ? '/dsm/v1/data/eco/shipments/events'
      : '/dsm/v1/data/ent/shipments',
    status: success ? 'Success' : 'Failed',
    code: input.delivery.httpStatus ?? (success ? 200 : 500),
    retry: input.delivery.attempts,
    timestamp: input.delivery.updatedAt || input.delivery.createdAt,
    request,
    response: asRecord(input.delivery.response),
  };
}
