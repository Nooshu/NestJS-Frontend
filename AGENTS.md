# AGENTS.md

Guidance for AI coding agents working in this repository.

Canonical Cursor rules also live in `.cursor/rules/` (always-applied `.mdc` files). Keep this document aligned with those rules when they change — prefer linking to `.mdc` files over conflicting duplicates.

## Project overview

- NestJS frontend PoC with GOV.UK Frontend (Nunjucks macros), Express adapter, and HMCTS-oriented patterns
- Default branch: `main`
- Upstream remote: `hmcts` (`hmcts/NestJS-frontend`)
- Push/pull default: `origin` (fork), unless doing an upstream sync

## Runtime

- Node.js and npm must match `engines` in `package.json`; keep `.nvmrc` and `.npmrc` aligned
- Current target: Node `>=26.5.0 <27`, npm `>=11.18.0 <12` (see `.nvmrc`)
- Prefer `nvm use` (or equivalent) before install/test commands
- Local default URL: **http://localhost:3002** (`npm run start:dev`)
- Docker Compose default URL: **http://localhost:3100** (`docker compose up frontend`) — see [Getting Started](docs/readme/getting-started.md)

## Before changing code

1. Sync with upstream `hmcts` first (see `.cursor/rules/project-standards.mdc`):
   - If the working tree is not clean, ask for confirmation (or create a branch) before syncing
   - `git fetch hmcts`
   - `git pull --rebase hmcts main`
2. Prefer focused, minimal diffs that match existing style

## Dependencies

- Prefer **patch and minor** updates unless explicitly asked for latest/major
- Prefer versions published at least **7 days** ago for routine updates (security fixes may skip the wait) — see `.cursor/rules/dependency-pinning.mdc`
- **Pin every dependency** to an exact version (no `^`, `~`, or ranges) — see `.cursor/rules/dependency-pinning.mdc`
- Keep `.npmrc` with `save-exact=true`
- Preserve `package-lock.json` integrity hashes (`"integrity": "sha512-..."`)
- Avoid introducing breaking changes; verify package integrity
- When updating **multiple** packages in one task:
  - Update all targets and refresh the lockfile first
  - Run pin + SHA verification **once** at the end (not after each package)
  - Use: `./scripts/verify-package-security.sh`
- Always run tests after dependency changes

## Package-only updates (auto origin sync)

If the change is **only** version bumps in `package.json` / `package-lock.json` (no other code changes), once checks pass:

1. `git fetch origin`
2. `git pull --rebase origin main`
3. `git push origin main` (or `git push --force-with-lease origin main` only when history was rebased)

## Server / application stack

- Prefer **NestJS**, **TypeScript**, and **Prisma/PostgreSQL** in `apps/server` (or Nest `src/` when that package does not exist) over ad-hoc Express scripts, untyped helpers, or alternate persistence — see `.cursor/rules/prefer-nestjs-prisma-stack.mdc`
- Prefer Nest modules, DI, pipes, guards, and typed DTOs; document **why** if choosing an alternative (e.g. TypeORM) and keep it inside Nest

## GOV.UK Frontend

- **GOV.UK Frontend is the single source of truth** for the user interface — see `.cursor/rules/govuk-frontend-ui.mdc`
- All GOV.UK Design System component HTML must come from official Nunjucks macros — do not hand-write component markup when a macro exists
- Prefer `{% from "govuk/components/.../macro.njk" import ... %}`; layout chrome (skip link, header, footer, breadcrumbs, pagination) must use macros
- Typography/layout utilities (`govuk-heading-*`, `govuk-body`, `govuk-grid-*`, `govuk-!-*-*`) are fine for composition; component structure still comes from macros
- Client-side UI should show/hide or populate **macro-rendered** markup rather than building GOV.UK component HTML in JavaScript
- Prefer GOV.UK Frontend HTML, CSS, and JS over **axe** / **axe-core** when they conflict (document/disable the scanner rule; do not rewrite GOV.UK) — see `.cursor/rules/prefer-govuk-over-axe.mdc`
- Interactivity via **app JS overrides only** (`src/frontend/js/`); keep `GOVUKFrontend.initAll()`; do not edit `node_modules/govuk-frontend` — see `.cursor/rules/govuk-frontend-js-overrides.mdc`
- Theming via **app SCSS/CSS overrides only** (`src/frontend/scss/`); do not fork vendor CSS — see `.cursor/rules/govuk-frontend-theming-overrides.mdc`
- Reuse Nunjucks partials and GOV.UK macros under `src/views/`; **do not duplicate account or feedback markup** — extract shared partials instead — see `.cursor/rules/reuse-nunjucks-partials.mdc`
- After GOV.UK Frontend upgrades, re-fingerprint assets, sync docs/version tables, and rely on macros (not hand-patched HTML)
- After any **GOV.UK Frontend** update, run all GOV.UK component tests and Playwright (smoke/e2e) for visual/page regressions — see `.cursor/rules/govuk-frontend-upgrade-tests.mdc`
- Run GOV.UK component fixture tests: `npm run test:govuk`

## Performance and accessibility

Treat **frontend performance**, **database performance**, and **accessible UI** as top priorities on every change — see `.cursor/rules/performance-and-accessibility.mdc`

- Frontend: avoid unnecessary JS/assets; watch Core Web Vitals; prefer progressive enhancement on macros
- Database: selective/indexed Prisma queries; avoid N+1 and unbounded lists; call out costly migrations
- Accessibility: preserve GOV.UK focus, labels, error summaries, and skip-link behaviour; do not break GOV.UK to silence axe
- Call out residual performance or a11y risks in summaries

## Documentation and code comments

See `.cursor/rules/docs-and-comments.mdc`.

- Keep **all** project documentation accurate when behaviour, versions, remotes, tooling, or standards change (README, `docs/**`, changelogs, templates, this file)
- Document **why** for non-obvious decisions; after dependency or GOV.UK upgrades, sync version/status tables
- Use **TSDoc-compatible** `/** */` comments: summary first, `@remarks` for longer constraints, `{@link}` / `@see` / `@deprecated` when useful
- **Do not** put TypeScript types in JSDoc braces (`@param {string} x` is wrong in `.ts`); use `@param x - Description`
- **Do not** use `@module`, `@requires`, `@class`, `@function`, or `@async` tags
- Write **comprehensive comments** on public modules/classes and non-trivial functions: purpose, behaviour, side effects, security/performance/GOV.UK constraints
- Annotate Nunjucks where macros are composed or client scripts depend on macro-rendered markup
- Explain **why** and constraints — not a line-by-line restatement of obvious code
- When changing code, update nearby comments and related docs in the same change
- Before finishing: docs confirmed, public APIs commented, and this file / `.cursor/rules` updated if a standing convention changed

## Testing and coverage

- Jest unit/integration/GOV.UK specs; Playwright for e2e
- Coverage thresholds are **100%** (statements, branches, functions, lines) for collected sources
- After **server TypeScript** changes, run type-check/build and relevant tests and **fix compile errors** in the same change — prefer real types over `any` / `@ts-ignore` — see `.cursor/rules/verify-ts-build-after-server-changes.mdc`
- Useful commands:
  - `npm test` — Jest with coverage
  - `npm run test:govuk` — GOV.UK fixture tests
  - `npm run test:smoke` — Playwright chromium smoke (health + key pages)
  - `npm run type-check` — TypeScript
  - `npm run build` — Nest compile (when relevant)
  - `npm run test:e2e` — Playwright (when needed)

## Git and commits

- Do **not** create commits unless the user asks
- Do **not** push unless the user asks, except the package-only auto-push rule above
- Never update git config; avoid destructive git commands unless explicitly requested
- Never use interactive git flags (`-i`)
- Never attach Cursor agent / `cursoragent` identity to commits or pushes (including `Co-Authored-By`, author/committer spoofing, or hook-injected agent trailers) — see `.cursor/rules/no-cursor-agent-commits.mdc`

## Communication

- Be direct and concise
- Summaries must include **risks** and **unresolved issues**

## Related rule files

| File | Purpose |
|------|---------|
| `.cursor/rules/project-standards.mdc` | Node/npm, hmcts/origin sync, tests after deps, summary risks |
| `.cursor/rules/dependency-pinning.mdc` | Exact pins, 7-day cooldown, single post-update SHA check |
| `.cursor/rules/prefer-nestjs-prisma-stack.mdc` | Prefer NestJS/TS/Prisma–PostgreSQL over ad-hoc patterns |
| `.cursor/rules/govuk-frontend-ui.mdc` | GOV.UK Frontend macros as UI source of truth |
| `.cursor/rules/govuk-frontend-upgrade-tests.mdc` | After GOV.UK bumps: run fixture + Playwright checks |
| `.cursor/rules/prefer-govuk-over-axe.mdc` | Prefer GOV.UK Frontend over axe when they conflict |
| `.cursor/rules/govuk-frontend-js-overrides.mdc` | GOV.UK interactivity via app JS overrides only |
| `.cursor/rules/govuk-frontend-theming-overrides.mdc` | GOV.UK theming via app SCSS/CSS overrides only |
| `.cursor/rules/reuse-nunjucks-partials.mdc` | Reuse partials/macros; no duplicate account/feedback markup |
| `.cursor/rules/performance-and-accessibility.mdc` | Frontend/DB performance + accessible UI priorities |
| `.cursor/rules/verify-ts-build-after-server-changes.mdc` | After server TS changes, verify build/tests; fix compile errors |
| `.cursor/rules/docs-and-comments.mdc` | Keep docs current; TSDoc-compatible comments (no typed `{Type}` braces) |
| `.cursor/rules/no-cursor-agent-commits.mdc` | Never attribute Cursor agent on commits/pushes |

Older tooling may look for `AGENT.md`; that path is a symlink to this file.
