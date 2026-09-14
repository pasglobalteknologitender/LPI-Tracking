export type TransVoyantMode = 'mock' | 'http';

export interface TransVoyantConfig {
  mode: TransVoyantMode;
  baseUrl: string;
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  requestTimeoutMs: number;
  defaultConcurrency: number;
}

export function loadTransVoyantConfig(
  env: NodeJS.ProcessEnv = process.env,
): TransVoyantConfig {
  const mode = env.TRANSVOYANT_MODE === 'http' ? 'http' : 'mock';
  const clientId = env.TRANSVOYANT_CLIENT_ID ?? '';
  const clientSecret = env.TRANSVOYANT_CLIENT_SECRET ?? '';

  return {
    mode,
    baseUrl: env.TRANSVOYANT_BASE_URL ?? 'https://api-staging.transvoyant.com',
    tokenUrl:
      env.TRANSVOYANT_TOKEN_URL ??
      'https://api-staging.transvoyant.com/uaa/v1/oauth/token',
    clientId,
    clientSecret,
    requestTimeoutMs: Number(env.TRANSVOYANT_TIMEOUT_MS ?? 15_000),
    defaultConcurrency: Number(env.WORKER_CONCURRENCY ?? 2),
  };
}

export function assertHttpTransVoyantReady(config: TransVoyantConfig): void {
  if (config.mode !== 'http') return;

  if (!config.clientId || !config.clientSecret) {
    throw new Error(
      'TransVoyant HTTP mode requires TRANSVOYANT_CLIENT_ID and TRANSVOYANT_CLIENT_SECRET',
    );
  }
}
