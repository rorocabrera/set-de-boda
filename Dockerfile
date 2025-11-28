# Multi-stage build for Set de Boda

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Ensure we install ALL dependencies (including devDependencies) for build
ENV NODE_ENV=development

COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

# Install server dependencies
COPY server/package.json ./
RUN npm install --production

# Copy server files
COPY server/*.js ./

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/dist ./dist

EXPOSE 3001

# Environment variables will be provided by Coolify
CMD ["node", "server.js"]
