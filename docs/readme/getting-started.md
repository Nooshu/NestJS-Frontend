# Getting Started

This guide covers running the NestJS Frontend app **with Node.js locally** or **with Docker**.

GOV.UK Frontend Nunjucks macros are the single source of truth for Design System component HTML. Prefer macros over hand-written GOV.UK markup — see [GOV.UK Frontend Integration](./govuk-frontend.md).

## Prerequisites

### Non-Docker (local Node.js)

| Tool | Requirement |
|------|-------------|
| Node.js | `>=26.5.0 <27` (`.nvmrc` pins `26.5.0`) |
| npm | `>=11.18.0 <12` |

```bash
# With nvm
nvm install
nvm use
node -v   # expect v26.5.x
npm -v    # expect 11.18.x or compatible 11.x
```

### Docker

| Tool | Requirement |
|------|-------------|
| Docker Desktop / Engine | Recent stable (Compose V2 included as `docker compose`) |
| Docker Compose | `docker compose version` works |

```bash
docker --version
docker compose version
```

---

## Option A — Getting started without Docker

Best for day-to-day development with hot reload.

```bash
# 1. Clone and enter the repo
git clone <your-fork-url> NestJS-Frontend
cd NestJS-Frontend

# 2. Use the pinned Node version
nvm use   # or: nvm install && nvm use

# 3. Install dependencies (exact versions via lockfile)
npm install

# 4. Start the development server (builds frontend assets + Nest watch)
npm run start:dev
```

Open **http://localhost:3002** (default local `PORT` in `src/main.ts`).

### Useful local commands

```bash
# Production-style local run
npm run build:prod
npm run start:prod

# Tests (Jest coverage thresholds are 100%)
npm test
npm run test:govuk
npm run type-check

# Frontend assets only
npm run build:frontend:dev
```

Override host/port if needed:

```bash
PORT=3002 HOST=0.0.0.0 npm run start:dev
```

---

## Option B — Getting started with Docker

Best for a containerised run that matches CI/deployment-style environments. The Compose stack exposes **port 3100** inside and on the host for the default `frontend` service.

### 1. Prepare (recommended)

Keeps `package-lock.json` in sync before the image build:

```bash
./scripts/prepare-docker.sh
```

### 2. Build and run (default service)

Use Compose V2 (`docker compose`). Legacy `docker-compose` works if installed.

```bash
# Build the image (Dockerfile target: development)
docker compose build frontend

# Start in the foreground
docker compose up frontend

# Or detached
docker compose up -d frontend
```

Open **http://localhost:3100**

### 3. Optional bind-mount “dev” profile

Maps host sources into the container on host port **3101** → container **3100**:

```bash
docker compose --profile dev up --build frontend-dev

# Detached
docker compose --profile dev up -d frontend-dev
```

Open **http://localhost:3101**

### 4. Everyday Docker commands

```bash
# Logs
docker compose logs -f frontend

# Stop
docker compose down

# Rebuild after dependency or Dockerfile changes
docker compose up --build frontend

# Tear down images/volumes from this project
docker compose down --rmi local --volumes --remove-orphans
```

### 5. Production-style image (Dockerfile `production` stage)

Compose defaults to the `development` stage (convenient for PoC). To build the leaner production stage:

```bash
docker build --target production -t nestjs-frontend:prod .

docker run --rm -p 3100:3100 \
  -e NODE_ENV=production \
  -e HOST=0.0.0.0 \
  -e PORT=3100 \
  nestjs-frontend:prod
```

### 6. Validate Docker config (without a full app run)

```bash
./scripts/validate-docker.sh
./scripts/test-docker-config.sh
```

### 7. If `node:26-alpine` will not pull

Pass an alternate official mirror via Compose:

```bash
NODE_IMAGE=public.ecr.aws/docker/library/node:26-alpine \
  docker compose up --build frontend
```

More detail: [Docker Setup — troubleshooting](../docker-setup.md#cannot-pull-node26-alpine).

---

## Port summary

| Mode | Default URL | Notes |
|------|-------------|--------|
| Local Node (`npm run start:dev`) | http://localhost:3002 | `PORT` defaults to `3002` in `src/main.ts` |
| Docker Compose `frontend` | http://localhost:3100 | Container `PORT=3100` |
| Docker Compose `frontend-dev` | http://localhost:3101 | Host 3101 → container 3100 |
| Raw `docker run` (as above) | http://localhost:3100 | Image `ENV PORT=3100` |

---

## Available Scripts

### Development

- `npm run start` - Start the application in standard mode
- `npm run start:dev` - Start development server with hot reload
  - Automatically builds frontend assets optimized for development
  - Compiles TypeScript on the fly
  - Watches for file changes and recompiles automatically
  - Provides hot reloading for faster development
  - Watches and rebuilds frontend assets when they change
- `npm run start:debug` - Start in debug mode with watch enabled
- `npm run start:prod` - Start production server from `dist/`

### Building

- `npm run build` - Compile TypeScript to JavaScript in `dist/`
- `npm run build:prod` - Full production build including frontend assets

### Testing

- `npm run test` - Jest with coverage (100% thresholds for collected sources)
- `npm run test:govuk` - GOV.UK Frontend component fixture tests
- `npm run test:e2e` / `npm run test:e2e:local` - Playwright end-to-end tests
- `npm run test:all` - Unit, integration, GOV.UK, and E2E
- `npm run type-check` - TypeScript `tsc --noEmit`

### Frontend Build

- `npm run build:frontend` - Production frontend assets (fingerprint)
- `npm run build:frontend:dev` - Development frontend assets (no fingerprint)
- `npm run build:scss` / `npm run build:scss:watch` - SCSS compile

### Code Quality

- `npm run format` - Prettier
- `npm run lint` / `npm run lint:check` - ESLint

### Docker helper scripts

- `./scripts/prepare-docker.sh` - Sync lockfile before image build
- `./scripts/setup-docker.sh` - Docker installation / setup checks
- `./scripts/validate-docker.sh` - Validate Dockerfile / Compose presence and config
- `./scripts/test-docker-config.sh` - Config smoke checks (base image, ports)

For deeper Docker detail, see [Docker Setup](../docker-setup.md).
