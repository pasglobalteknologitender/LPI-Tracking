import type { TransVoyantConfig } from './config.js';
import type {
  ShipmentAttributesPayload,
  ShipmentEventPayload,
  TokenProvider,
  TransVoyantClient,
  TransVoyantResponse,
} from './types.js';

export class HttpTransVoyantClient implements TransVoyantClient {
  constructor(
    private readonly config: TransVoyantConfig,
    private readonly tokenProvider: TokenProvider,
  ) {}

  async patchShipmentAttributes(
    payload: ShipmentAttributesPayload,
  ): Promise<TransVoyantResponse> {
    return this.request('PATCH', '/shipments/attributes', payload);
  }

  async postShipmentEvent(payload: ShipmentEventPayload): Promise<TransVoyantResponse> {
    return this.request('POST', '/shipments/events', payload);
  }

  private async request(
    method: string,
    path: string,
    payload: unknown,
    refreshAttempted = false,
  ): Promise<TransVoyantResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.requestTimeoutMs);

    try {
      const token = await this.tokenProvider.getAccessToken();
      const response = await fetch(`${this.config.baseUrl}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (response.status === 401 && !refreshAttempted) {
        return this.request(method, path, payload, true);
      }

      let body: unknown = null;
      const text = await response.text();
      if (text) {
        try {
          body = JSON.parse(text);
        } catch {
          body = { raw: text };
        }
      }

      return { status: response.status, body };
    } finally {
      clearTimeout(timeout);
    }
  }
}
