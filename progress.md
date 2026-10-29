# Portfolio UX implementation

Source: [UX plan](docs/portfolio-ux-plan.md). Goal: personal home, concise complete directory, linked full stories.

Preserve existing changes and published content. Reuse established JSX component conventions, including the component-length exception already recorded in Shell.tsx. Git Bash failed with E_ACCESSDENIED; use the available shell for local work.

- DONE — Home/navigation and resume overview: intro/philosophy/interests, all published roles and projects, three headline achievements per entry, employer-project impact summaries, concise print layout. Files: home, resume, Shell, Portfolio, ResumeOverview.
- DONE — Full experience pages, stable achievement anchors, contents, target highlighting/focus and Back focus restoration. Files: experience route, EntryDetails, ProjectCaseStudy, ExperienceProjectCard, DetailNavigation, OverviewReturn, detail-links, base.css. Existing URLs remain available; sitemap includes experience detail pages.
- DONE — Positive/negative checks: full published-content coverage for all 19 entries, missing routes, mobile/keyboard accessibility, reduced motion, no-JavaScript reading, direct links, refresh and stale anchors. Browser suite passes.
- DONE — Performance: production build and initial JavaScript budget pass. Floating chat loads on first open and remains mounted after closing to preserve session state.
- DONE — Race/idempotency: 20 simultaneous pages retain content; repeated navigation, reload, and chat close/reopen pass. No content mutations introduced.
- DONE — Source reconciliation recorded in [content coverage](docs/portfolio-content-coverage.md); private and unverified notes remain unpublished. Published JSON unchanged by this task.

## Verification

- `node node_modules/typescript/bin/tsc --noEmit`: pass.
- `node node_modules/eslint/bin/eslint.js src tests/e2e/portfolio.spec.ts`: pass.
- `node node_modules/prettier/bin/prettier.cjs --check src tests/e2e/portfolio.spec.ts`: pass.
- `node node_modules/vitest/vitest.mjs run`: 38 tests pass; workspace temporary directory avoids sandbox cache rename errors.
- `node node_modules/next/dist/bin/next build --webpack`: pass; elevated local execution avoids sandbox-generated directory failures.
- `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3219 node node_modules/@playwright/test/cli.js test`: 43 tests pass with chat disabled for deterministic checks.
- Visual review: desktop home and complete resume overview screenshots; automated accessibility/layout at 320, 768 and 1440px.
- `git diff --check`: pass.

Fixed during verification: ambiguous legacy test selectors, omitted contribution text on three projects, target activation during client navigation, return-link focus, and the initial JavaScript budget. Native achievement links provide browser target behavior; session storage restores overview focus, with ordinary browser navigation as the storage-denied fallback.

Preview: http://127.0.0.1:3219. Not deployed. Original local ports were occupied, so verification used a separate server. No production credentials were changed.

Required retro completed: no durable guidance edit; the existing guidance already covers preserving changes, environment verification and source publication boundaries.
