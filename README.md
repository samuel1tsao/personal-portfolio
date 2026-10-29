# Samuel Tsao personal portfolio

[Live portfolio](https://samuel-tsao.vercel.app) · [Public source](https://github.com/samuel1tsao/personal-portfolio)

A personal portfolio for software engineering and applied ML work. The site brings together career history, selected projects, a web resume, and ways to connect.

## What’s here

- **Home:** Introduction, engineering philosophy, interests, and contact links.
- **Projects and case studies:** Browse published projects at `/projects` or read a project story at `/work/<slug>`.
- **Resume & Work:** Scan every role and project at `/resume`, then open full-entry links or linked employer-project titles for the details. Use Print / Save as PDF for the concise overview.
- **Portfolio chat:** Ask about Samuel’s experience, projects, or how to connect at `/chat`. A pinned button also opens chat while browsing. Responses use published portfolio content; email and profile links are available directly.
- **Accessible and discoverable pages:** Responsive layouts, keyboard navigation, page metadata, structured profile data, sitemap, and production-only indexing.

## How it works

The site uses a Next.js and TypeScript frontend in `frontend/`. A FastAPI backend in `backend/` validates and serves the published portfolio content from `backend/content/portfolio.json`. Vercel runs these as connected services: only the frontend is public, and it calls the backend through a private service binding. Chat generation runs through AI Gateway from the frontend server when enabled.

## Run locally

Requires Node.js 22 or 24, Corepack, uv, and Python 3.12. Corepack runs the pnpm version pinned in `frontend/package.json`. Run these commands in two Git Bash terminals, starting from the repository root.

In the first terminal, start the content backend:

```bash
cd backend
uv run python -m uvicorn app:app --host 127.0.0.1 --port 8111 --reload
```

In the second terminal, start the frontend:

```bash
cd frontend
npm run dev
```

Open [http://127.0.0.1:3217](http://127.0.0.1:3217). Keep both terminals running; press **Ctrl+C** in each to stop. Dependency installation is needed on initial setup and after dependency changes. If your existing `frontend/.env.local` sets `SITE_URL` or `CONTENT_API_URL`, update those values to ports 3217 and 8111 respectively, or remove the overrides.

Both commands watch for changes: `corepack pnpm dev` reloads frontend edits, and the backend's `--reload` restarts it when Python files change. Check the homepage, `/projects`, `/experience`, `/resume`, and individual project and role pages before pushing. Edit portfolio content in `backend/content/portfolio.json`; the backend reads it on each request, but the frontend caches content, so restart the frontend if an update does not appear. JSON edits do not automatically reload the browser.

The local portfolio needs no AI Gateway credentials. To test with chat disabled even when `.env.local` enables it, start the frontend with:

```bash
CHAT_AGENT_ENABLED=false corepack pnpm dev
```

If the default ports are occupied, stop your previous local servers or run both services on alternate ports:

```bash
# Backend terminal, from backend/
uv run python -m uvicorn app:app --host 127.0.0.1 --port 8005 --reload

# Frontend terminal, from frontend/
CONTENT_API_URL=http://127.0.0.1:8005 corepack pnpm dev --port 3005
```

Then open [http://127.0.0.1:3005](http://127.0.0.1:3005). The service URL override applies only to this local command.

## Develop and deploy

Resume copy decisions and verification: [Implementation log](progress.md#resume-copy-and-link-review).

See [Development and deployment](docs/development-and-deployment.md) for local setup, content editing, checks, and Vercel configuration. The local portfolio can run without Gateway credentials; configure chat separately when needed.

Local source research is excluded from the public repository until publication details are reviewed.
