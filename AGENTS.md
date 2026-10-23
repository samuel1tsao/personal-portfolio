# Portfolio repository guidance

Use the shared [workspace guidance](../AGENTS.md) and [coding standards](../coding-standards.md).

## Repository notes

- `frontend/` is the Next.js and TypeScript app; `backend/` is the FastAPI content service. See `docs/development-and-deployment.md` for local setup and deployment.
- Public portfolio content belongs in `backend/content/portfolio.json` and must satisfy `backend/models.py`; don't add private notes or unreviewed research details.
- Keep `.env.local` and `AI_GATEWAY_API_KEY` server-only and untracked. Never expose or log secret values.
- For Next.js changes, read the installed guides under `frontend/node_modules/next/dist/docs/` before using framework APIs.
- Reusable skills are installed in the workspace at `../.agents/skills/` and recorded in `../skills-lock.json`.
