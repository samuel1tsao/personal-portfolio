# Samuel Tsao personal portfolio

Public source: [samuel1tsao/personal-portfolio](https://github.com/samuel1tsao/personal-portfolio).

Live portfolio: [samuel-tsao.vercel.app](https://samuel-tsao.vercel.app).

Personal software engineering and applied ML portfolio, deployed as Vercel services.

Stack: React/Next.js frontend, Python/FastAPI content backend, and an owner-only Vercel AI Gateway routing experiment using available free credits.

- [Website feature plan](docs/features/personal-portfolio.md)
- [Implementation plan](docs/features/personal-portfolio-implementation.md)
- [UX, Vercel hosting, and search discoverability decisions](docs/portfolio-ux-and-discoverability.md)
- [Development, tests, and Vercel deployment](docs/development-and-deployment.md)
- [Implementation progress and verification](progress.md)

Implementation: React/Next.js in `frontend/`, Python/FastAPI in `backend/`. Root `vercel.json` configures both as services in one project, with a frontend-to-backend runtime binding. Follow the development guide for `vercel dev -L` or separate local servers.

The current deployment guide supersedes the earlier plans' two-project hosting and build-time content-fetch design. Only the frontend is public; the FastAPI backend is internal-only and reachable through its service binding.

Local source research is excluded from the public repository until publication details are reviewed.
