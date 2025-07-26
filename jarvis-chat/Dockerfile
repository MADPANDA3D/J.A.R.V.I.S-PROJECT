# Multi-stage build for production optimization
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
# Skip prepare script (husky) in Docker build
RUN npm pkg delete scripts.prepare
RUN npm ci --omit=dev

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Build arguments for optimization
ARG NODE_ENV=production
ARG BUILD_MODE=optimized

# Set environment variables
ENV NODE_ENV=$NODE_ENV
ENV BUILD_MODE=$BUILD_MODE

COPY package.json package-lock.json* ./
# Skip prepare script (husky) in Docker build
RUN npm pkg delete scripts.prepare
RUN npm ci

COPY . .

# Run optimized build (this automatically uses the Vite config optimizations)
RUN echo "🔨 Building with optimizations enabled..." && \
    npm run build && \
    echo "✅ Build completed with code splitting and optimizations"

# Production image, copy all the files and run the app
FROM nginx:alpine AS runner
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy the built application to nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]