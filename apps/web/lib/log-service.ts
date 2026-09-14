import { fetchLogs } from './api';
import type { IntegrationLog } from '@lpi/contracts';

export async function getLogs(): Promise<IntegrationLog[]> {
  return fetchLogs();
}
