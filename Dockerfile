# Use Node.js 26 to match package.json engines (>=26.5.0 <27).
# Override if Hub is slow, e.g.:
#   docker build --build-arg NODE_IMAGE=public.ecr.aws/docker/library/node:26-alpine .
ARG NODE_IMAGE=node:26-alpine
FROM ${NODE_IMAGE} AS base

# Align global npm with engines (>=11.18.0 <12); pin major to avoid npm 12+
RUN npm install -g npm@11

WORKDIR /app

# Runtime defaults for later stages. Do NOT set NODE_ENV=production here:
# npm would omit soft/devDependencies and postinstall (patch-package) would fail.
ENV HOST=0.0.0.0 \
    PORT=3100

COPY package*.json ./
# Required for postinstall → patch-package
COPY patches ./patches

# Full install (incl. patch-package) so postinstall can apply patches
RUN npm install --legacy-peer-deps && npm cache clean --force

# Development stage (full install + build; also used by docker compose `frontend`)
FROM base AS development

ENV NODE_ENV=development

COPY . .

RUN npm run build:prod

EXPOSE 3100

CMD ["node", "dist/main"]

# Production stage (leaner runtime image)
FROM base AS production

ENV NODE_ENV=production

COPY --from=development /app/dist ./dist

# Prod deps only. Ignore scripts: postinstall needs patch-package (dev-only) and
# current patches target jest/string-length, which are not installed in production.
RUN npm install --omit=dev --ignore-scripts --legacy-peer-deps && npm cache clean --force

RUN addgroup -g 1001 -S nodejs \
  && adduser -S nestjs -u 1001 \
  && chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3100

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||3100)+'/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "dist/main"]
