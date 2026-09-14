import type {
  ShipmentAttributesPayload,
  ShipmentEventPayload,
  TransVoyantClient,
  TransVoyantResponse,
} from './types.js';

export class MockTransVoyantClient implements TransVoyantClient {
  async patchShipmentAttributes(
    payload: ShipmentAttributesPayload,
  ): Promise<TransVoyantResponse> {
    return {
      status: 201,
      body: {
        mode: 'mock',
        operation: 'shipment_attributes',
        payload,
      },
    };
  }

  async postShipmentEvent(payload: ShipmentEventPayload): Promise<TransVoyantResponse> {
    return {
      status: 201,
      body: {
        mode: 'mock',
        operation: 'shipment_event',
        payload,
      },
    };
  }
}
