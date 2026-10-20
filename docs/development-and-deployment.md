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

Visit `http://127.0.0.1:3000`. Content is served by FastAPI and rendered into HTML by Next.js. Next.js has no browser-facing API proxy; both separate-server development and deployed server rendering fetch content server-side. Deployed functions use the runtime `CONTENT_SERVICE_URL` binding, and builds make no content requests. Copy `.env.example` to `.env.local` in the frontend when configuring a deployment. Local defaults require no secrets.

## Checks

Backend: `uv run pytest -q`, `uv run ruff check .`, `uv run ruff format --check .`.

Frontend: `pnpm format:check`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm typecheck`. Builds require no backend or binding; the API is needed only when serving content at runtime. For browser tests run `pnpm exec playwright install chromium` followed by `pnpm test:e2e`; Playwright starts a production Next.js server. It checks recruiter paths, accessibility, narrow screens, no-JS navigation, clipboard success/failure, concurrent reads and JavaScript budget. Screenshots go to ignored `frontend/artifacts/`.

For the mobile Lighthouse audit, keep `pnpm start` running and run `pnpm audit:performance`. The report is local lab evidence, not field Core Web Vitals. Field INP and indexing cannot be verified before launch and sufficient real traffic.

## Editing content

Edit `backend/content/portfolio.json`. Pydantic forbids extra/private fields and malformed links; `published: false` excludes a story from API responses, runtime pages, and sitemap. Keep unpublished notes outside this public data file. Duplicate slugs/orders fail validation. `updated` is the actual editorial update date. API content revisions are SHA-256 hashes of normalized public content. Runtime responses are schema-validated; service bindings target the backend from the same deployment, without a manually pinned revision. Content failures stop rendering rather than inventing missing information.

Current content omits unreviewed employer metrics, client identity, repository/demo links and the original PDF. `/resume` is an HTML resume with a print layout. Before launch, review the public email and facts. Add a PDF only after reviewing its contact information; do not create a broken PDF link. The experience stories intentionally avoid reconstructed proprietary diagrams.

## One Vercel project with services

The root `vercel.json` replaces the earlier two-project proposal. Set the Vercel project's Root Directory to the repository root, not `frontend/` or `backend/`. Do not add top-level build/runtime overrides; the frontend build command belongs to its service. The user confirmed the service names and requested an internal-only backend on 2026-10-20.

Confirmed services:

| Service    | Directory/framework            | Public ingress       | Internal calls                              |
| ---------- | ------------------------------ | -------------------- | ------------------------------------------- |
| `backend`  | `backend/`, FastAPI, `app:app` | None (internal-only) | None                                        |
| `frontend` | `frontend/`, Next.js           | Catch-all `/(.*)`    | Calls backend through `CONTENT_SERVICE_URL` |

Only the frontend receives public traffic. The backend has no public rewrite and remains internal. `/api/v1/portfolio`, `/api/v1/stories/*`, and `/backend/*` on the public site return 404; there is no public proxy to Python or LLM inference. Server-rendered pages fetch Python content privately through the binding. FastAPI still handles its original `/api/v1/...` paths internally.

The frontend declares one binding: `{ "type": "service", "service": "backend", "format": "url", "env": "CONTENT_SERVICE_URL" }`. Vercel injects that variable; **do not set it yourself**. Server functions read it when handling requests. They preserve any path prefix in the generated base URL and do not send public Deployment Protection bypass credentials. A binding grants reachability, not application-level authorization.

The homepage, resume, stories, and sitemap now render at runtime. Builds never contact the backend or enumerate story slugs. Core content is still returned as server-rendered HTML, including metadata and structured data. Schema validation, bounded GET retry and timeout remain. The old `CONTENT_REVISION` pin and `CONTENT_API_BYPASS_SECRET` are removed; a shared deployment and deployment-aware binding replace manual project pairing. `CONTENT_API_URL` is only a fallback for separate local Next.js/uvicorn development, not a hosted service-discovery setting.

Project environment settings:

- Set `SITE_URL` to the intended canonical HTTPS production origin. This is required for metadata during build; use the assigned production Vercel hostname until a custom domain is connected.
- Set `SITE_INDEXABLE=true` only for the reviewed public production site; Vercel preview builds stay noindex. Keep it false during setup.
- Remove any manually configured `CONTENT_SERVICE_URL`, `CONTENT_API_URL`, `CONTENT_REVISION`, and `CONTENT_API_BYPASS_SECRET` from Vercel project settings. The binding supplies the service URL automatically.
- Gateway experiments remain owner-only CLI operations; no Gateway key is needed to deploy or browse the portfolio. Shared project environment variables are not service-specific secrets, so do not add unrelated private credentials.

To test the actual multi-service routing locally from the repository root (PowerShell):

```powershell
$env:SITE_URL = 'http://127.0.0.1:3010'
$env:SITE_INDEXABLE = 'false'
npm exec --yes --package=vercel@64.7.0 -- vercel dev -L --listen 127.0.0.1:3010
```

This starts both services and injects the binding without a cloud login. The frontend service explicitly uses `pnpm dev`, with webpack matching production builds; this avoids the observed Turbopack hydration/HMR issue behind the local services router. Never run `next build` and `vercel dev` concurrently against the same frontend directory; they share `.next` artifacts. For browser regression against this router, run `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3010` through your shell and `pnpm test:e2e --grep-invert 'initial JavaScript'` in `frontend/`. The JS budget applies to production builds, not development bundles.

Push to the linked GitHub `main` branch and deploy the root Vercel project. Check homepage/resume/story HTML, public API 404 behavior, frontend assets, runtime binding, preview protection, canonical/robots/sitemap and absence of binding URLs/secrets in HTML. Rollback operates on the single deployment. Custom domain DNS and Search Console verification can follow. Runtime backend failures now affect page rendering; monitor API latency and errors, and measure field vitals after deployment.

Sources: [Vercel Services](https://vercel.com/docs/services), [runtime-only bindings](https://vercel.com/docs/services/bindings), [path-preserving routing](https://vercel.com/docs/services/routing).

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
