import {
  assertHttpTransVoyantReady,
  loadTransVoyantConfig,
  type TransVoyantConfig,
} from './config.js';
import { HttpTransVoyantClient } from './http-client.js';
import { MockTransVoyantClient } from './mock-client.js';
import {
  HttpOAuthTokenProvider,
  MockTokenProvider,
} from './token-provider.js';
import type { TokenProvider, TransVoyantClient } from './types.js';

export * from './config.js';
export * from './types.js';
export * from './token-provider.js';
export * from './mock-client.js';
export * from './http-client.js';
export * from './mappers.js';

export function createTransVoyantClient(
  config: TransVoyantConfig = loadTransVoyantConfig(),
): TransVoyantClient {
  if (config.mode === 'mock') {
    return new MockTransVoyantClient();
  }

  assertHttpTransVoyantReady(config);
  const tokenProvider = createTokenProvider(config);
  return new HttpTransVoyantClient(config, tokenProvider);
}

export function createTokenProvider(
  config: TransVoyantConfig = loadTransVoyantConfig(),
): TokenProvider {
  if (config.mode === 'mock') {
    return new MockTokenProvider();
  }

  assertHttpTransVoyantReady(config);
  return new HttpOAuthTokenProvider(config);
}
