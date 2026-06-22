# syntax=docker/dockerfile:1

# ---- Shared base ----
FROM node:22.23.0-bookworm-slim AS base
WORKDIR /app
COPY package*.json ./

# ---- Development stage ----
FROM base AS dev
RUN --mount=type=cache,target=/root/.npm \
    npm ci
COPY . .
CMD ["npm", "run", "dev:docker"]

# ---- Builder (compiles TS) ----
FROM base AS builder
RUN --mount=type=cache,target=/root/.npm \
    npm ci
COPY . .
RUN npm run build

# ---- Prod deps only ----
FROM base AS deps
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# ---- Production stage ----
FROM node:22.23.0-bookworm-slim AS prod
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps    --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist         ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
