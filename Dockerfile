# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
COPY packages/contracts/package.json packages/contracts/
COPY packages/database/package.json packages/database/
COPY packages/transvoyant/package.json packages/transvoyant/
RUN npm ci

FROM deps AS web-builder
COPY . .
RUN mkdir -p apps/web/public
ARG NEXT_PUBLIC_APP_URL=http://localhost:3100
ARG API_URL=http://api:3001
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV API_URL=$API_URL
ENV NODE_ENV=production
RUN npm run build -w @lpi/web

FROM base AS web
ENV NODE_ENV=production
ENV PORT=3100
ENV HOSTNAME=0.0.0.0
ENV API_URL=http://api:3001
COPY --from=web-builder /app/apps/web/.next/standalone ./
COPY --from=web-builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=web-builder /app/apps/web/public ./apps/web/public
EXPOSE 3100
CMD ["node", "apps/web/server.js"]

FROM base AS api
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
COPY packages/contracts/package.json packages/contracts/
COPY packages/database/package.json packages/database/
COPY packages/transvoyant/package.json packages/transvoyant/
RUN npm ci
COPY apps/api apps/api
COPY packages packages
COPY tsconfig.base.json ./
COPY apps/api/docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENV NODE_ENV=production
ENV API_HOST=0.0.0.0
ENV API_PORT=3001
EXPOSE 3001
ENTRYPOINT ["/entrypoint.sh"]
