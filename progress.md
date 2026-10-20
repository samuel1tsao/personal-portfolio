# Implementation progress

Source: [implementation plan](docs/features/personal-portfolio-implementation.md).
Goal: recruiter portfolio with React, Python content service, and private Gateway CLI.
Status: user confirmed service names and requested an internal-only backend. Vercel project `samuel-tsao` is created and linked; hostname `samuel-tsao.vercel.app` is assigned and verified. Configuring and verifying deployment. No paid LLM requests performed.

## Working agreements

- 2026-10-20 services revision: user requests one multi-service Vercel project. Prepare/test locally, then obtain explicit confirmation of names, public routes and binding before pushing/deploying this revision. Existing readability exception remains applicable.
- Confirmation received: keep service names, make backend internal where possible, use a Samuel Tsao-based hostname. Frontend stays public to serve the requested portfolio. Removing all API ingress/proxy routes; binding unchanged.

- Preserve existing planning files. Use resume-backed content without invented repository links or confidential diagrams; omit unreviewed metrics and downloadable PDF.
- Approved 2026-10-20: scoped exception to implement skill's 250-character function and one-level helper limits for React, validation, API handling, and tests. Keep functions cohesive/readable. Other coding rules apply.
- Dependencies: npm/pnpm and Python package installation, local ports, browser test runtime. Domain, Vercel account secrets, model IDs, public PDF remain launch inputs.

## Work items

| Status  | Item/files                           | Acceptance / verification                                                                                                                               |
| ------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DONE    | Vercel services migration            | Root config; frontend -> backend `CONTENT_SERVICE_URL` binding; runtime-render pages/sitemap; local-only until confirmation                             |
| DONE    | Services positive/negative checks    | 19 unit tests pass; missing/malformed binding, prefix preservation, schema/failure recovery; Vercel-style build passes without binding or reachable API |
| DONE    | Services performance/concurrency     | 9 production browser tests pass, including JS budget/20 concurrent reads; runtime SSR mobile Lighthouse 97 performance / 100 accessibility / 100 SEO    |
| DONE    | Services local integration           | `vercel dev -L` detects both services; 8 functional/axe/no-JS/concurrency tests pass through generated binding; API and frontend assets/404s verified   |
| DONE    | Python content/models/API            | 31 backend/content/Gateway tests pass; draft filtering, safe errors, no writes/inference endpoint                                                       |
| DONE    | React UI/SEO/content contract        | Home, 3 stories, print resume statically built; API/schema and rendering checks pass                                                                    |
| DONE    | Gateway CLI                          | Mocked validation/auth/quota/fallback/timeout checks pass; no live calls                                                                                |
| DONE    | Positive/negative integration checks | 9 browser tests pass; API rewrite, no-JS, clipboard denial, 404 recovery, keyboard/axe at 3 widths                                                      |
| DONE    | Performance/load                     | 20 concurrent reads pass; modern JS ~134 KiB gzip; indexable mobile Lighthouse 99 performance / 100 accessibility / 100 SEO                             |
| DONE    | Race/idempotency                     | Concurrent/repeat API reads identical and isolated; no persistent writes or shared counters                                                             |
| DONE    | Deployment/CI/runbook                | GitHub workflow and deployment guide added; local rewrite/revision build verified                                                                       |
| DONE    | GitHub publication                   | Public `samuel1tsao/personal-portfolio`, default branch `main`; source pushed and remote Python/frontend checks passed; private research excluded       |
| IN_PROGRESS | Services push/rollout                | Confirmed names/internal backend; samuel-tsao project linked and hostname verified; publishing/deploying                            |

## Verification and fixes

Services revision: builds no longer fetch Python content because bindings are runtime-only. Runtime binding URLs support internal HTTP origins and preserve base paths; no public-origin/bypass credential or manual revision pin is used. Vercel root routing preserves `/api/v1` to match FastAPI. Local Vercel tests initially failed without `SITE_URL`; explicit local canonical configuration fixed startup. Turbopack dev hydration/HMR behind the router failed clipboard/navigation tests; explicit `pnpm dev` with webpack fixed all 8 routed browser checks. Root configuration has no misplaced build/runtime keys. CI now builds before starting Python to guard against build-time API dependencies. Previous static-build verification below is historical; current runtime-rendering checks supersede that deployment model.

Final services verification: backend 31 tests, frontend 19 unit tests, production browser 9 tests, plus 8 browser checks through actual `vercel dev -L` routing/bindings. Lint, format, types and both backend-free Vercel-style build and ordinary production build pass. Runtime SSR mobile lab scores: 97/100 performance, 100/100 accessibility, 100/100 SEO; no field/ranking claim. No shared mutable state or transaction model changed. A Next.js-generated `frontend/AGENTS.md` appeared during local dev; its relevant bundled guides were reviewed. No commit, push, remote project update, credential changes or LLM requests were made for this revision. Next: requested user confirmation, then publish and deploy.

Fixed low-contrast decorative numbers, enlarged-text overflow, wordmark wrapping and accessible naming. Screenshots reviewed at desktop/mobile; axe passes at 320/768/1440px. JS measurement excludes legacy nomodule polyfills that modern browsers do not load. pnpm optional resolver build explicitly disabled; frozen install works. Ruff project rules scoped. Lighthouse uses Playwright's working Windows launcher. API fetches use no-store plus a revision check, avoiding stale build-cache responses; sitemap explicitly prerendered to support this. A failing sitemap build was corrected and rebuilt successfully.

- Backend: `python -m pytest -c backend/pyproject.toml backend/tests -q`: **31 passed**; ruff lint and format check pass. One upstream Starlette/httpx test-client deprecation warning remains; no test failures.
- Frontend: `pnpm test`: **15 passed**; `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build`: pass.
- Browser: `pnpm test:e2e`: **9 passed**. Includes no-JS, actual API rewrite, missing-route status, clipboard recovery, keyboard, enlarged text/reflow, responsive axe checks, concurrent reads and modern JS budget.
- `pnpm audit:performance`: indexable mobile lab **99 performance / 100 accessibility / 100 SEO**. Reports/screenshots are ignored local artifacts in `frontend/artifacts/`. These are lab scores, not production field metrics or ranking guarantees.
- Unit tests cover failed dependencies, schema/revision mismatch, preview noindex, training/search bot separation, Gateway authentication/quota/fallback/ambiguous timeout, draft exclusion and repeated-read isolation. No real Gateway requests.
- No pagination, migrations, persistent writes, or shared transactional state; concurrent reads are exercised instead. Hosted LLM auth/quota races do not apply to the owner-only CLI.

## Remaining rollout inputs

Confirm the proposed `backend`/`frontend` service names, backend public `/api/v1/*`, frontend catch-all, and frontend-to-backend `CONTENT_SERVICE_URL` binding before pushing or deploying this revision. Then use the existing project at repository root, set its canonical `SITE_URL`, and verify deployment via the [guide](docs/development-and-deployment.md). Do not manually set the binding variable. No custom domain or Gateway key is required for the initial content site. Earlier GitHub Actions passed for the published version; the local services revision has not run remotely. Field vitals and indexing require deployment and traffic.
