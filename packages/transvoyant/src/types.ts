export interface ShipmentAttributesPayload {
  customerReferenceNumber: string;
  carrier?: string;
  carrierSCAC?: string;
  bol?: string;
  houseAwb?: string;
  vesselName?: string;
  voyage?: string;
  pol?: string;
  pod?: string;
  container?: string;
  containerType?: string;
}

export interface ShipmentEventPayload {
  customerReferenceNumber: string;
  container?: string;
  eventType: string;
  eventTime: string;
  location?: string;
  trackingSuffix?: string;
}

export interface TransVoyantResponse {
  status: number;
  body: unknown;
}

export interface TransVoyantClient {
  patchShipmentAttributes(payload: ShipmentAttributesPayload): Promise<TransVoyantResponse>;
  postShipmentEvent(payload: ShipmentEventPayload): Promise<TransVoyantResponse>;
}

export interface TokenProvider {
  getAccessToken(): Promise<string>;
}
