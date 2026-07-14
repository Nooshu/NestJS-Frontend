# Use Node.js 26 to match package.json engines (>=26.5.0 <27).
# Override if Hub is slow, e.g.:
#   docker build --build-arg NODE_IMAGE=public.ecr.aws/docker/library/node:26-alpine .
ARG NODE_IMAGE=node:26-alpine
FROM ${NODE_IMAGE} AS base

# Align global npm with engines (>=11.18.0 <12); pin major to avoid npm 12+
RUN npm install -g npm@11

# Set working directory
WORKDIR /app

# Container defaults (compose can override). Local non-Docker default remains 3002 in main.ts.
ENV HOST=0.0.0.0 \
    PORT=3100 \
    NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install all dependencies first to ensure lock file is in sync
# Use npm install instead of npm ci to handle peer dependency conflicts
RUN npm install --legacy-peer-deps && npm cache clean --force

# Development stage (full install + build; also used by docker compose `frontend`)
FROM base AS development

ENV NODE_ENV=development

# Copy source code
COPY . .

# Build the application
RUN npm run build:prod

# Expose application port (maps to ENV PORT)
EXPOSE 3100

# Start the application
CMD ["node", "dist/main"]

# Production stage (leaner runtime image)
FROM base AS production

# Copy built application from development stage
COPY --from=development /app/dist ./dist

# Install only production dependencies for the final image
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs \
  && adduser -S nestjs -u 1001 \
  && chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3100

# Health check against the in-container PORT
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||3100)+'/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/main"]
