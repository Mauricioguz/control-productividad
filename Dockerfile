# ── Cambio 1: Dockerfile para Next.js monolítico ──────────────────────────────
FROM node:20-alpine AS base

# Instalar dependencias del sistema necesarias para Prisma con PostgreSQL
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# ── Etapa de dependencias ──────────────────────────────────────────────────────
FROM base AS deps
COPY package*.json ./
RUN npm ci

# ── Etapa de build ─────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar el cliente Prisma para PostgreSQL
RUN npx prisma generate

# Build de Next.js en modo producción
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# ── Etapa de producción (imagen final ligera) ──────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Usuario no-root por seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar los archivos necesarios del build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Ejecutar migraciones y luego arrancar Next.js
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
