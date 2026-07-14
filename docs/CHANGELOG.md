# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed

- Updated GOV.UK Frontend from `6.1.0` to `6.3.0`
- Replaced hand-written GOV.UK markup with official Nunjucks macros (skip link, footer, breadcrumbs, pagination wrapper, inset text, error summary, buttons)
- Extended GOV.UK component fixture coverage for newer components (`generic-header`, `password-input`, `service-navigation`, `task-list`, `exit-this-page`)
- Synchronized documentation with the current GOV.UK Frontend version
- Raised Jest coverage thresholds to 100% (statements, branches, functions, lines)
- Aligned agent/contributor guidance (`AGENTS.md`, `.cursor/rules/`) with pinned dependencies, GOV.UK macros as UI SSoT, documentation/comments standards, and upstream `hmcts` / fork `origin` remotes
- Added `.cursor/rules/docs-and-comments.mdc` requiring current docs and comprehensive comments for future developers
- Enriched JSDoc / template comments on key entry points (bootstrap, view engine, CSRF, Express adapter, Jest transform)

### Documentation

- Synchronized versions and project status with `package.json` (July 2026):
  - NestJS (`@nestjs/common`): `11.1.28`
  - Express: `5.2.1`
  - GOV.UK Frontend: `6.3.0` (macros mandatory / single source of truth for component HTML)
  - TypeScript: `6.0.3` (pinned; not 7 because of ts-jest)
  - Node.js: `>=26.5.0 <27` (`.nvmrc` `26.5.0`)
  - npm: `>=11.18.0 <12`
  - Jest: ~1,505 tests across ~68 suites (Playwright e2e separate)
  - Exact dependency pins; SHA verification via `bash scripts/verify-package-security.sh` once after batch updates
- Updated `README.md`, `docs/KEYFEATURES.md`, `docs/configuration.md`, `docs/dependency-management.md`, `docs/readme/getting-started.md`, `docs/readme/govuk-frontend.md`, and related docs with current versions and coverage thresholds
- Updated `CONTRIBUTING.md`, `MAINTAINABILITY_IMPROVEMENTS.md`, health/migration docs Node.js references, and testing coverage guidance
- Aligned Docker base images (`Dockerfile`, `Dockerfile.render`) to Node 26 Alpine to match `engines`

### Changed (earlier)

- Updated Node.js engine requirement from `>=20.12.2` to `>=20.11.1` to use standard LTS version
- Synchronized all package version numbers in documentation with current package.json versions
- Updated documentation to reflect current dependency versions:
  - NestJS packages: `11.1.6`
  - GOV.UK Frontend: `6.3.0`
  - TypeScript: `6.0.3`
  - Node.js: `26.5.0`
  - npm: `11.18.0`
  - Playwright: `1.55.0`
  - Jest: `30.1.1`
  - Cache Manager: `7.2.0`
  - ioredis: `5.9.3`
  - Pino: `9.9.0`
  - Sass: `1.91.0`

### Documentation (earlier)

- Updated `docs/dependency-management.md` with correct version numbers
- Updated `docs/keyfeatures.md` with current package versions
- Updated `docs/configuration.md` with Node.js version requirement
- Updated `docs/readme/govuk-frontend.md` with current GOV.UK Frontend version
- Updated `docs/react-nestjs-integration.md` with current NestJS versions
- Updated `docs/comprehensive-health-checks.md` with Node.js version
- Updated `docs/prisma-migration.md` with Node.js version requirement
- Updated `docs/training-onboarding.md` with Node.js version requirement
