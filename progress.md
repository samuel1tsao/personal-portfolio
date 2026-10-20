# Implementation progress

Source: [implementation plan](docs/features/personal-portfolio-implementation.md).
Goal: recruiter portfolio with React, Python content service, and private Gateway CLI.
Status: local implementation complete and verified on 2026-10-20. Publishing source to the authorized public GitHub repository; Vercel device login is pending. No paid LLM requests performed.

## Working agreements

- Preserve existing planning files. Use resume-backed content without invented repository links or confidential diagrams; omit unreviewed metrics and downloadable PDF.
- Approved 2026-10-20: scoped exception to implement skill's 250-character function and one-level helper limits for React, validation, API handling, and tests. Keep functions cohesive/readable. Other coding rules apply.
- Dependencies: npm/pnpm and Python package installation, local ports, browser test runtime. Domain, Vercel account secrets, model IDs, public PDF remain launch inputs.

## Work items

| Status | Item/files | Acceptance / verification |
| --- | --- | --- |
| DONE | Python content/models/API | 31 backend/content/Gateway tests pass; draft filtering, safe errors, no writes/inference endpoint |
| DONE | React UI/SEO/content contract | Home, 3 stories, print resume statically built; API/schema and rendering checks pass |
| DONE | Gateway CLI | Mocked validation/auth/quota/fallback/timeout checks pass; no live calls |
| DONE | Positive/negative integration checks | 9 browser tests pass; API rewrite, no-JS, clipboard denial, 404 recovery, keyboard/axe at 3 widths |
| DONE | Performance/load | 20 concurrent reads pass; modern JS ~134 KiB gzip; indexable mobile Lighthouse 99 performance / 100 accessibility / 100 SEO |
| DONE | Race/idempotency | Concurrent/repeat API reads identical and isolated; no persistent writes or shared counters |
| DONE | Deployment/CI/runbook | GitHub workflow and deployment guide added; local rewrite/revision build verified |
| IN_PROGRESS | GitHub publication | Public `samuel1tsao/personal-portfolio` created; reviewed source staged, private research excluded |
| BLOCKED | Remote Vercel rollout | Official device login awaiting user authentication; project deployment follows login |

## Verification and fixes

Fixed low-contrast decorative numbers, enlarged-text overflow, wordmark wrapping and accessible naming. Screenshots reviewed at desktop/mobile; axe passes at 320/768/1440px. JS measurement excludes legacy nomodule polyfills that modern browsers do not load. pnpm optional resolver build explicitly disabled; frozen install works. Ruff project rules scoped. Lighthouse uses Playwright's working Windows launcher. API fetches use no-store plus a revision check, avoiding stale build-cache responses; sitemap explicitly prerendered to support this. A failing sitemap build was corrected and rebuilt successfully.

- Backend: `python -m pytest -c backend/pyproject.toml backend/tests -q`: **31 passed**; ruff lint and format check pass. One upstream Starlette/httpx test-client deprecation warning remains; no test failures.
- Frontend: `pnpm test`: **15 passed**; `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build`: pass.
- Browser: `pnpm test:e2e`: **9 passed**. Includes no-JS, actual API rewrite, missing-route status, clipboard recovery, keyboard, enlarged text/reflow, responsive axe checks, concurrent reads and modern JS budget.
- `pnpm audit:performance`: indexable mobile lab **99 performance / 100 accessibility / 100 SEO**. Reports/screenshots are ignored local artifacts in `frontend/artifacts/`. These are lab scores, not production field metrics or ranking guarantees.
- Unit tests cover failed dependencies, schema/revision mismatch, preview noindex, training/search bot separation, Gateway authentication/quota/fallback/ambiguous timeout, draft exclusion and repeated-read isolation. No real Gateway requests.
- No pagination, migrations, persistent writes, or shared transactional state; concurrent reads are exercised instead. Hosted LLM auth/quota races do not apply to the owner-only CLI.

## Remaining rollout inputs

Use [development and deployment guide](docs/development-and-deployment.md). Configure Vercel project pair/domain and verify remote previews, protection, HTTPS and DNS. Set Gateway key/eligible IDs privately before owner-run experiments. Review public email, roles, optional PDF and any future employer metrics/repository links before publishing. GitHub workflows are configured but have not run remotely. Field vitals and actual indexing require deployment and traffic. No coding work remains pending those external inputs.
