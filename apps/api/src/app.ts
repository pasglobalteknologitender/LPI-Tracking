import { sql } from 'drizzle-orm';
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { createDb, type Database } from '@lpi/database';
import { config } from './config.js';
import { authRoutes } from './routes/auth.js';
import { logRoutes } from './routes/logs.js';
import { shipmentRoutes } from './routes/shipments.js';
import { userRoutes } from './routes/users.js';

declare module 'fastify' {
  interface FastifyInstance {
    db: Database;
  }
}

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: config.nodeEnv === 'production' ? 'info' : 'debug',
      redact: ['req.headers.authorization', 'req.headers.cookie', 'password', 'password_hash'],
    },
    genReqId: () => crypto.randomUUID(),
    requestIdHeader: 'x-request-id',
  });

  app.decorate('db', createDb(config.databaseUrl));

  await app.register(sensible);
  await app.register(cookie);
  await app.register(cors, {
    origin: config.appOrigin,
    credentials: true,
  });

  app.setErrorHandler((error: Error & { statusCode?: number }, request, reply) => {
    request.log.error(error);
    const statusCode = error.statusCode ?? 500;
    reply.status(statusCode).send({
      success: false,
      message: statusCode >= 500 ? 'Internal Server Error' : error.message,
    });
  });

  app.get('/health/live', async () => ({ status: 'ok' }));

  app.get('/health/ready', async (request, reply) => {
    try {
      await app.db.execute(sql`select 1`);
      return { status: 'ready' };
    } catch (error) {
      request.log.error(error);
      return reply.status(503).send({ status: 'not_ready' });
    }
  });

  await app.register(authRoutes);
  await app.register(shipmentRoutes);
  await app.register(userRoutes);
  await app.register(logRoutes);

  return app;
}
