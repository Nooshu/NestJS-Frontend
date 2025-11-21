# Use Node.js 20 LTS as the base image
FROM node:24-alpine AS base

# Update npm to the latest version
RUN npm install -g npm@latest

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies first to ensure lock file is in sync
# Use npm install instead of npm ci to handle peer dependency conflicts
RUN npm install --legacy-peer-deps && npm cache clean --force

# Development stage
FROM base AS development

# Copy source code
COPY . .

# Build the application
RUN npm run build:prod

# Expose port 3100
EXPOSE 3100

# Start the application
CMD ["node", "dist/main"]

# Production stage
FROM base AS production

# Copy built application from development stage
COPY --from=development /app/dist ./dist

# Install only production dependencies for the final image
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership of the app directory
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port 3100
EXPOSE 3100

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3100/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/main"] 