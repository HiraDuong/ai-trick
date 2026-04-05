# Build từ thư mục gốc monorepo:
#   docker build -f apps/backend/Dockerfile -t ikp-backend .
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/

RUN npm ci

COPY apps/backend ./apps/backend

RUN npm run prisma:generate --workspace=backend \
  && npm run build --workspace=backend \
  && npm prune --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 express

COPY --from=builder --chown=express:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=express:nodejs /app/package.json ./package.json
COPY --from=builder --chown=express:nodejs /app/apps/backend ./apps/backend

USER express
EXPOSE 4000

CMD ["node", "apps/backend/dist/index.js"]
