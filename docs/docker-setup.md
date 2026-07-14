# Docker Setup for NestJS Frontend

Containerised runbook for the NestJS Frontend application. For a side-by-side **Docker vs local Node** quick start, see [Getting Started](./readme/getting-started.md).

## Overview

- Multi-stage `Dockerfile` on **Node 26 Alpine** (matches `package.json` engines `>=26.5.0 <27`)
- Compose V2 (`docker compose`) with:
  - `frontend` — default service on host **3100**
  - `frontend-dev` — optional bind-mount profile on host **3101**
- Application binds `HOST=0.0.0.0` inside containers (see `src/main.ts`)
- Container default `PORT=3100` (local non-Docker default remains **3002**)

## Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage: `base` → `development` → `production` |
| `Dockerfile.render` | Render.com-oriented production build |
| `docker-compose.yml` | `frontend` + optional `frontend-dev` profile |
| `.dockerignore` | Keeps build context small |
| `scripts/prepare-docker.sh` | Sync lockfile before `docker compose build` |
| `scripts/validate-docker.sh` | Presence + Compose config + port checks |
| `scripts/test-docker-config.sh` | Base image / port smoke checks |
| `scripts/setup-docker.sh` | Docker Desktop / Compose detection |

## Prerequisites

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop) (or Engine + Compose V2)
2. Confirm:

```bash
docker --version
docker compose version
```

3. Prepare dependencies:

```bash
./scripts/prepare-docker.sh
```

## Quick Start

### Default service (`frontend`)

```bash
docker compose build frontend
docker compose up frontend

# Detached
docker compose up -d frontend
```

Open **http://localhost:3100**

### Bind-mount profile (`frontend-dev`)

```bash
docker compose --profile dev up --build frontend-dev
# Detached: docker compose --profile dev up -d frontend-dev
```

Open **http://localhost:3101**

### Production Dockerfile stage

Compose uses the `development` stage by default (convenient for this PoC). Lean production image:

```bash
docker build --target production -t nestjs-frontend:prod .
docker run --rm -p 3100:3100 \
  -e NODE_ENV=production \
  -e HOST=0.0.0.0 \
  -e PORT=3100 \
  nestjs-frontend:prod
```

## Everyday commands

```bash
docker compose logs -f frontend
docker compose down
docker compose up --build frontend
docker compose --profile dev logs -f frontend-dev
docker compose down --rmi local --volumes --remove-orphans
```

Validate without building:

```bash
./scripts/validate-docker.sh
./scripts/test-docker-config.sh
```

## Port map

| Mode | URL | Notes |
|------|-----|--------|
| Local Node | http://localhost:3002 | `PORT` default in `src/main.ts` |
| Compose `frontend` | http://localhost:3100 | `PORT=3100` in Compose |
| Compose `frontend-dev` | http://localhost:3101 | Host 3101 → container 3100 |
| `docker run` (prod target) | http://localhost:3100 | Image `ENV PORT=3100` |

## Environment variables

| Variable | Typical Docker value | Purpose |
|----------|----------------------|---------|
| `NODE_ENV` | `development` / `production` | Runtime mode |
| `HOST` | `0.0.0.0` | Listen address (required for published ports) |
| `PORT` | `3100` | HTTP listen port inside the container |

## Health checks

Compose and the production image probe `GET /health` on the container port.

```bash
curl -f http://localhost:3100/health
```

## Troubleshooting

### Cannot pull `node:26-alpine`

Docker Hub / network timeouts. Pull first, then build:

```bash
docker pull node:26-alpine
docker compose build frontend
```

Or build with the AWS public mirror of the same official image:

```bash
docker build \
  --build-arg NODE_IMAGE=public.ecr.aws/docker/library/node:26-alpine \
  --target development \
  -t nestjs-frontend:dev \
  .
docker run --rm -p 3100:3100 -e HOST=0.0.0.0 -e PORT=3100 nestjs-frontend:dev
```

Compose can pass the same arg via:

```yaml
# under frontend.build
args:
  NODE_IMAGE: public.ecr.aws/docker/library/node:26-alpine
```

(or `docker compose build --build-arg NODE_IMAGE=public.ecr.aws/docker/library/node:26-alpine frontend`).

### Port already in use

```bash
lsof -i :3100
docker compose down
```

### Peer dependency / lockfile issues

```bash
./scripts/prepare-docker.sh
docker compose build --no-cache frontend
```

The Dockerfile already uses `npm install --legacy-peer-deps`.

### Permission issues (bind mounts)

```bash
sudo chown -R "$USER:$USER" .
```

## CI sketch

```yaml
- uses: actions/checkout@v4
- name: Build
  run: docker compose build frontend
- name: Smoke health
  run: |
    docker compose up -d frontend
    sleep 40
    curl -f http://localhost:3100/health
    docker compose down
```

## References

- [Getting Started](./readme/getting-started.md) — Docker and non-Docker onboarding
- [Docker docs](https://docs.docker.com/)
- [Compose V2](https://docs.docker.com/compose/)
- [Node official images](https://hub.docker.com/_/node)
