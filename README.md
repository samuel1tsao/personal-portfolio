# Samuel Tsao personal portfolio

[Live portfolio](https://samuel-tsao.vercel.app) · [Public source](https://github.com/samuel1tsao/personal-portfolio)

A personal portfolio for software engineering and applied ML work. The site brings together career history, selected projects, a web resume, and ways to connect.

## What’s here

- **Home:** A short introduction, areas of focus, selected work, experience, background, and contact links.
- **Projects and case studies:** Browse published projects at `/projects` or read a project story at `/work/<slug>`.
- **Web resume:** Experience, accomplishments, skills, education, and projects at `/resume`; use the browser’s Print / Save as PDF option for a copy.
- **Portfolio chat:** Ask about Samuel’s experience, projects, or how to connect at `/chat`. A pinned button also opens chat while browsing. Responses use published portfolio content and should acknowledge when it does not support an answer; email and profile links are available directly. See the [chat prompt and context plan](docs/features/chat-context-retrieval.md).
- **Accessible and discoverable pages:** Responsive layouts, keyboard navigation, page metadata, structured profile data, sitemap, and production-only indexing.

## How it works

The site uses a Next.js and TypeScript frontend in `frontend/`. A FastAPI backend in `backend/` validates and serves the published portfolio content from `backend/content/portfolio.json`. Vercel runs these as connected services: only the frontend is public, and it calls the backend through a private service binding. Chat generation runs through AI Gateway from the frontend server when enabled.

## Develop and deploy

See [Development and deployment](docs/development-and-deployment.md) for local setup, content editing, checks, and Vercel configuration. The local portfolio can run without Gateway credentials; configure chat separately when needed.

Local source research is excluded from the public repository until publication details are reviewed.
