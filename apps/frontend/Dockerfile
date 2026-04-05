# Build từ thư mục gốc monorepo (Next.js output: standalone):
#   docker build -f apps/frontend/Dockerfile -t ikp-frontend .
# Debian slim (glibc): Tailwind v4 / lightningcss có binary linux-gnu; Alpine musl thường thiếu optional native.
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# Không copy package-lock.json: lockfile tạo trên Windows thường thiếu optional native linux (Tailwind v4 / lightningcss / oxide).
COPY package.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/
RUN npm install

COPY apps/frontend ./apps/frontend

ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build --workspace=frontend

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/public ./apps/frontend/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "apps/frontend/server.js"]
