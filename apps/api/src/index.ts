import { buildApp } from './app.js';
import { config } from './config.js';

const app = await buildApp();

try {
  await app.listen({ port: config.port, host: config.host });
  app.log.info(`API listening on http://${config.host}:${config.port}`);
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
