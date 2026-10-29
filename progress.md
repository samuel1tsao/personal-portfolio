# Portfolio UX implementation

Source: [UX plan](docs/portfolio-ux-plan.md). Goal: personal home, concise complete directory, linked full stories.

Preserve existing changes and published content. Reuse established JSX component conventions, including the component-length exception already recorded in Shell.tsx. Git Bash failed with E_ACCESSDENIED; use the available shell for local work.

- IN_PROGRESS — Home/navigation and resume overview; verify typecheck and browser navigation.
- TODO — Full experience pages, achievement anchors, contents and accessible target feedback; verify detail coverage and stale links.
- TODO — Positive/negative checks: published content coverage, missing routes, keyboard/mobile and direct links.
- TODO — Performance: production build and existing transfer/load checks.
- TODO — Race/idempotency: concurrent page requests and repeated detail navigation; read-only content introduces no mutations.
- TODO — Reconcile original source coverage and document publication gaps without publishing private notes automatically.

Next: implement reading layers, then run checks and record results.
