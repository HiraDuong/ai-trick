# Build từ chính thư mục apps/backend.
FROM node:20-bookworm-slim AS base
ENV DEBIAN_FRONTEND=noninteractive
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder

COPY . .

RUN npm run prisma:generate \
  && npm run build \
  && npm prune --omit=dev

FROM base AS runner
ENV NODE_ENV=production
ENV HOST=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs express

COPY --from=builder --chown=express:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=express:nodejs /app/package.json ./package.json
COPY --from=builder --chown=express:nodejs /app/dist ./dist
COPY --from=builder --chown=express:nodejs /app/prisma ./prisma
COPY --from=builder --chown=express:nodejs /app/prisma.config.ts ./prisma.config.ts

USER express
EXPOSE 8080

CMD ["npm", "run", "start:cloudrun"]
