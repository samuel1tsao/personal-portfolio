# Development and deployment

## Local setup

Requires Node 22 or 24, pnpm 11.25.0, uv, and Python 3.12. Locked dependencies are in `frontend/pnpm-lock.yaml` and `backend/uv.lock`. The bundled pnpm runtime used Node 24 locally; CI is configured for Node 22.

In a terminal at `backend/`:

```powershell
uv sync --frozen
uv run uvicorn app:app --host 127.0.0.1 --port 8000
```

In a second terminal at `frontend/`:

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

Visit `http://127.0.0.1:3000`. Content is served by FastAPI and rendered into HTML by Next.js. The local API rewrite is `/api/v1/portfolio`; deployed and build-time requests use `CONTENT_API_URL`. Copy `.env.example` to `.env.local` in the frontend when configuring a deployment. Local defaults require no secrets.

## Checks

Backend: `uv run pytest -q`, `uv run ruff check .`, `uv run ruff format --check .`.

Frontend: `pnpm format:check`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm typecheck`. Keep the Python API running during build. For browser tests run `pnpm exec playwright install chromium` followed by `pnpm test:e2e`; Playwright starts a production Next.js server. It checks recruiter paths, accessibility, narrow screens, no-JS navigation, clipboard success/failure, concurrent reads and JavaScript budget. Screenshots go to ignored `frontend/artifacts/`.

For the mobile Lighthouse audit, keep `pnpm start` running and run `pnpm audit:performance`. The report is local lab evidence, not field Core Web Vitals. Field INP and indexing cannot be verified before launch and sufficient real traffic.

## Editing content

Edit `backend/content/portfolio.json`. Pydantic forbids extra/private fields and malformed links; `published: false` excludes a story from API responses, generated routes, and sitemap. Keep unpublished notes outside this public data file. Duplicate slugs/orders fail validation. `updated` is the actual editorial update date. API content revisions are SHA-256 hashes of normalized public content. The frontend rejects schema/revision mismatches and failed API builds rather than deploying partial pages.

Current content omits unreviewed employer metrics, client identity, repository/demo links and the original PDF. `/resume` is an HTML resume with a print layout. Before launch, review the public email and facts. Add a PDF only after reviewing its contact information; do not create a broken PDF link. The experience stories intentionally avoid reconstructed proprietary diagrams.

## Two Vercel projects

No deployment or DNS change has been made by this implementation.

1. Connect the Git repository to two projects. Backend root directory: `backend`; FastAPI framework with `app:app` entrypoint and supported Python 3.12. Use the checked-in uv lock. Frontend root: `frontend`; Next.js preset, pnpm install, `pnpm build`. Check current Hobby eligibility before publishing commercial functionality.
2. Deploy the backend first. Confirm `GET /api/v1/portfolio` returns 200, schema `1`, published stories, and a revision. Runtime bundled content is read-only; no local storage is used.
3. Set frontend `CONTENT_API_URL` to that backend's origin and `CONTENT_REVISION` to its returned hash. Use an immutable backend deployment URL where possible. Set `SITE_URL` to the intended canonical HTTPS origin. Set `SITE_INDEXABLE=false` until public launch. Vercel builds require both site URL and revision; credentials never use a `NEXT_PUBLIC_` variable.
4. Backend production content reads must be public for frontend runtime rewrites. Protect draft previews with Vercel Authentication. If fetching a protected backend preview at build time, use `CONTENT_API_BYPASS_SECRET` server-side. This secret is only attached to build fetches; browser API rewrites do not bypass backend protection. For anonymous rewrite tests, use a public backend containing only publishable content. Never disable protection on private drafts merely to make rewrites work.
5. Pair previews with the matching backend revision. For the deployment spike verify: direct backend GET, frontend rewrite GET, matching revisions, correct 404, preview authentication, noindex headers, and no credential leakage. Account/project access is required to verify this remotely; local rewrite checks do not establish Vercel preview behavior.
6. Run CI and inspect preview pages before promoting the frontend. Use backward-compatible `/v1` responses when updating Python first. On failure retain the existing frontend; rollback backend/frontend to the recorded matching pair. If slugs change, add explicit permanent redirects in `next.config.ts`.
7. Connect the chosen domain using Vercel's displayed DNS records, preserving mail records. Redirect alternate hosts to the canonical domain, verify HTTPS, then set `SITE_INDEXABLE=true` and rebuild only the final public production site. Verify generated HTML robots, robots.txt, sitemap, canonical and social preview. Keep all previews noindex/protected. Verify domain ownership in Search Console and submit the sitemap.

## Owner-only AI Gateway lab

The lab is a local CLI, not an unauthenticated HTTP inference API. No credits were used during implementation or CI.

In the backend terminal set `AI_GATEWAY_API_KEY`, `AI_MODEL_FAST`, and `AI_MODEL_QUALITY` through your shell/secret manager. Choose currently free-tier-eligible IDs from the Vercel dashboard. `.env.example` documents names; the CLI does not automatically read `.env` files. Never commit keys or pass them as CLI arguments.

```powershell
uv run python scripts/route_prompt.py --route fast
uv run python scripts/route_prompt.py --route quality --fallback fast
```

The prompt is read interactively. Only public test inputs should be submitted. Aliases constrain model choices; limits are 2000 prompt characters, 256 output tokens, and 20 seconds total. Only known 502/503 failures permit one configured fallback. Ambiguous timeouts do not retry. Results print text, model, usage and request ID to your terminal; logs omit prompts and credentials.

Check balance and current model eligibility before each session. Vercel currently documents $5/month for eligible models on the Gateway free tier; purchasing credits ends that monthly free allocation. Keep auto top-up disabled and stop on quota errors. Hosting/function limits remain separate. No automatic cost estimate or hard account budget is implied by the CLI. Enable appropriate dashboard budgets if available. Sources: [pricing](https://vercel.com/docs/ai-gateway/pricing), [Chat Completions](https://vercel.com/docs/ai-gateway/sdks-and-apis/openai-chat-completions), [FastAPI hosting](https://vercel.com/docs/frameworks/backend/fastapi).

A hosted public experiment requires a separate design for authentication, atomic shared quotas, abuse handling, and billing limits. Process-local counters would not enforce a deployment-wide limit.
