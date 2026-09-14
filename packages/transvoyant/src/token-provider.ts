import type { TransVoyantConfig } from './config.js';
import type { TokenProvider } from './types.js';

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

interface OAuthTokenResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
}

export class HttpOAuthTokenProvider implements TokenProvider {
  private cached: CachedToken | null = null;

  constructor(private readonly config: TransVoyantConfig) {}

  async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.cached && this.cached.expiresAt > now + 30_000) {
      return this.cached.accessToken;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.requestTimeoutMs);

    try {
      const body = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      });

      const response = await fetch(this.config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`TransVoyant token request failed with status ${response.status}`);
      }

      const payload = (await response.json()) as OAuthTokenResponse;
      if (!payload.access_token) {
        throw new Error('TransVoyant token response missing access_token');
      }

      const ttlMs = (payload.expires_in ?? 3600) * 1000;
      this.cached = {
        accessToken: payload.access_token,
        expiresAt: now + ttlMs,
      };

      return payload.access_token;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export class MockTokenProvider implements TokenProvider {
  async getAccessToken(): Promise<string> {
    return 'mock-transvoyant-access-token';
  }
}
