# ==============================================================================
# MULTI-STAGE PRODUCTION DOCKERFILE — ANTIGRAVITY AGENCY PLATFORM
# Task 28 — Step 6: Containerized Production Deployment
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Frontend Assets (Vite)
# ------------------------------------------------------------------------------
FROM node:24-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies (including devDependencies needed for Vite build)
RUN npm ci

# Copy full source tree
COPY . .

# Build production bundle
ENV NODE_ENV=production
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Runtime
# ------------------------------------------------------------------------------
FROM node:24-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV APP_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built frontend assets
COPY --from=builder /app/dist ./dist

# Copy backend server code and Prisma schemas
COPY server ./server

# Create non-root node user and set ownership
RUN chown -R node:node /app
USER node

# Expose default HTTP server port
EXPOSE 5000

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/v1/health/live || exit 1

# Start production server
CMD ["node", "server/src/server.js"]
