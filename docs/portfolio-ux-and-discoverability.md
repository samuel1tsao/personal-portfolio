# Portfolio UX, hosting, and discoverability decisions

Status: Proposed | October 19, 2026. Companion to the implementation plan; no application, account connection, purchase, or deployment is included in this planning step.

## Technology choice

Use Next.js App Router as the React frontend, TypeScript, and CSS Modules. Python/FastAPI validates and serves portfolio content through versioned JSON endpoints. Prerender pages from that API so recruiters and crawlers receive ordinary HTML. Next.js supplies metadata, social images, robots, and sitemap conventions ([documentation](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)). Python owns content serving and LLM integration; Next.js handles presentation and HTML generation.

Deploy `frontend/` and `backend/` as two Vercel projects from one repository. Vercel supports FastAPI as a function, subject to runtime limits ([FastAPI deployment](https://vercel.com/docs/frameworks/backend/fastapi)). Frontend rewrites expose `/api/v1/*` on the site origin; validate mapping and paired previews first. Public content reads are anonymous; Gateway secrets stay in Python. Use local fonts and SVG diagrams with text equivalents.

Content changes deploy Python first, then build the frontend using that backend revision. Check `schema_version` and `content_revision`; reject timeouts/mismatches instead of publishing incomplete pages. The last successful frontend stays readable if the API fails. This adds deployment ordering but preserves HTML discoverability. Bundled JSON is read-only; no persistent disk or database is assumed.

## AI Gateway experimentation

Vercel currently includes **$5/month** starting with the first request, for a **subset of free-tier-eligible models**, with lower per-model rate limits. Buying credits moves the team to paid usage and ends the monthly free allocation. Keep auto top-up disabled and verify account balance/eligibility before live tests. Hosting quotas and domain charges are separate ([current pricing](https://vercel.com/docs/ai-gateway/pricing)).

Start with an owner-only Python CLI. It maps allowlisted route aliases to two eligible models using httpx, Gateway Chat Completions, and a backend-only key. Verify current IDs/prices at setup; do not assume all Claude/OpenAI models qualify. Distinguish model selection from provider failover ([API contract](https://vercel.com/docs/ai-gateway/sdks-and-apis/openai-chat-completions), [routing](https://vercel.com/docs/ai-gateway/models-and-providers/provider-options)).

Limit prompts to 2000 characters, output to 256 tokens, and total deadline to 20 seconds. No tools, uploads, browsing, or arbitrary upstream URLs. Log model, latency, tokens and request IDs, not prompts. Permit at most one eligible fallback for a known provider failure; never retry ambiguous timeouts or silently choose paid models. Stop on exhausted credits, check balance before sessions, and use platform budgets where available. Local counters are not global spending limits. A public lab needs separate authentication and shared atomic quotas; it is not assumed here. Mock Gateway calls in CI; the recruiter experience remains independent of LLM availability.

## Routes and recruiter layout

| Route | Purpose and layout |
| --- | --- |
| `/` | Main identity, evidence, career summary, About, and contact. Navigation: Work, Experience, About, Resume, Connect. Section links work without JavaScript. |
| `/work/[slug]` | One substantial, published story per URL. A shared template distinguishes personal projects from employer experience. |
| `/resume.pdf` | Reviewed, sanitized PDF, linked with format and file size. The HTML homepage remains the primary profile, not a PDF-only resume. |
| Unknown route | Real 404 response, short explanation, and Home/Work recovery links. |

Provisional story slugs: `asset-recommendation-engine`, `infrastructure-autoscaling`, and `marketplace-search`. These are proposed route names, not verified repository names. Publish only stories with adequate evidence; do not launch empty templates to reach three pages.

Desktop homepage: a 1120px maximum content width, simple header, generous vertical space, off-white background, dark body text, and one restrained blue or teal accent. Hero leads with **Samuel Tsao**, then **Senior Software Engineer | Distributed Systems & Applied ML** as proposed positioning. Add a two-sentence summary, San Jose location, and View work / Resume actions. Follow with up to three supported impact highlights, three story cards, a compact reverse-chronological career timeline, skills grouped by demonstrated work, education, and contact. No unconfirmed availability badge.

Mobile: single-column cards, visible primary actions, 16px minimum body text, 44px interaction targets, clear focus states, and no sideways page scrolling. Prefer wrapping navigation to a JS-dependent menu. Reading columns stay near 65–75 characters. Use a single light theme initially, accessible contrast, and minimal motion.

Story layout: title and plain-language summary; role/team/dates/skills; supported outcome; problem and constraints; personal contribution versus team context; architecture diagram and text equivalent; decisions and rejected alternatives; evaluation/results and limitations; verified code/demo links; resume/contact. Keep the overview short enough to scan before deeper technical reading. Diagrams should answer a question, such as how market data becomes a recommendation or where autoscaling decisions occur. Do not invent proprietary architectures.

## Vercel setup and release

1. Verify the GitHub repository/remote and connect it through Vercel's Git integration. Use `main` as production only if it matches the repository's eventual branch convention. Pull requests receive previews; production branch changes deploy through the integration ([Vercel GitHub guide](https://vercel.com/docs/git/vercel-for-github)). Run CI checks before merge and keep production on reviewed commits.
2. Use protected preview deployments with Vercel Authentication and retain noindex behavior. Confirm public production remains accessible without login. Vercel documents Standard Protection's public production scope and automatic noindex headers for previews; inspect the actual project settings and response headers ([protection](https://vercel.com/docs/deployment-protection), [headers](https://vercel.com/docs/headers/response-headers)). Preview access and indexing controls are distinct concerns.
3. Choose one personal domain after checking ownership, availability, and renewal price. A name-based domain is easy to share; no domain availability is assumed and no extension is promised a ranking boost. Select apex or `www` as canonical, redirect the other and any publicly accessible alternate production hostname, and verify redirects preserve paths. Configure `SITE_URL` explicitly for metadata and sitemap generation.
4. Add the domain in Vercel, apply the exact DNS values shown for the project, and verify HTTPS and public access. Do not hard-code generic DNS records into the plan ([domain setup](https://vercel.com/docs/domains/set-up-custom-domain)). Review DNS changes so existing email records survive.
5. Start with Hobby only if the portfolio meets its personal, non-commercial use terms. It is currently free within included limits; domain registration/renewal is separate. Reassess terms and paid hosting if selling services or introducing commercial functionality; there is no reason to subscribe to a paid plan during planning ([Hobby terms and limits](https://vercel.com/docs/plans/hobby)).
6. Smoke-test the production URL, mobile layout, downloadable resume, canonical/robots headers, sitemap, and bot access before submitting to search engines. Record the known-good deployment for rollback. Optional Vercel Speed Insights can follow launch; avoid unnecessary third-party scripts.

## Google discovery

The strongest initial goal is accurate, prominent results for **Samuel Tsao software engineer**, **Samuel Tsao machine learning**, and specific project names. Broad queries such as “best software engineers” are not realistic launch acceptance criteria. Search engines decide crawling, indexing, and ranking; eligibility is not placement.

- Proposed homepage title: `Samuel Tsao | Senior Software Engineer & Applied ML`. Use the exact same name consistently, disambiguated by role, location, and verified profiles. Titles and descriptions summarize real content rather than repeated keywords.
- Write original case studies with concrete contributions, qualified results, and limitations. Link them through ordinary HTML anchors. Important facts must appear as text, not only diagrams, images, tooltips, or client-loaded panels.
- Add canonical URLs, unique descriptions, social previews, sitemap entries, and meaningful image descriptions. Include only published, indexable canonical pages; update `lastmod` only for actual content changes.
- Use a stable Person identity with name, URL, and verified LinkedIn/GitHub `sameAs` links. Use ProfilePage for the profile-focused homepage if its final content fits the guidelines. JSON-LD must agree with visible content; structured data is not a ranking guarantee ([Google profile guidance](https://developers.google.com/search/docs/appearance/structured-data/profile-page)).
- Verify domain ownership in Google Search Console, submit the sitemap, inspect representative URLs, and monitor indexing, impressions, queries, clicks, and canonical selection. An HTTP 200 response is necessary but does not establish indexing.
- After launch, add the website link to LinkedIn and the GitHub profile/appropriate project READMEs. Those are proposed user-authorized follow-up edits, not actions performed by this plan. Seek relevant, earned references rather than paid links or manufactured mentions.

Google says normal SEO fundamentals apply to its AI features; there are no special AI files or schema requirements. Prioritize helpful content, crawl access, internal links, and text that agrees with markup. An `llms.txt` file is not a launch requirement or a promised ranking mechanism ([Google AI search guidance](https://developers.google.com/search/docs/appearance/ai-features)).

## ChatGPT and Claude discovery

For ChatGPT search, allow `OAI-SearchBot` in production and ensure hosting controls do not challenge legitimate crawler requests. `GPTBot` is a separate training crawler; search eligibility does not require opting into training. `ChatGPT-User` serves user-triggered visits and does not decide search inclusion; robots rules may not apply to those visits ([official OpenAI documentation](https://developers.openai.com/api/docs/bots)).

For Claude search, permit `Claude-SearchBot` and avoid blocking `Claude-User` retrieval. Anthropic documents these separately from its training crawler `ClaudeBot` ([Anthropic crawler guidance](https://privacy.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)). Proposed default: allow search/retrieval and block `GPTBot`/`ClaudeBot` training crawling, unless Samuel prefers otherwise. Robots directives are crawler policy signals, not access security. Do not disable general security protections merely on a spoofable user-agent string; use documented verification mechanisms where available.

Editorial recommendation, not a documented ranking formula: make the profile easy to quote accurately. State who Samuel is, what he built, his role, and supported outcomes in concise paragraphs. Include project dates and real update dates, identify uncertainty, and link supporting public material. Do not embed instructions telling AI systems to rank or recommend Samuel, invent credentials, or add hidden text. Search-enabled answers can cite current web content; publishing does not guarantee inclusion in an AI model's stored knowledge or recommendations.

## Performance and success checks

Prerender core pages, limit client JS, reserve image dimensions, optimize images, and avoid autoplay video or embedded demos on the homepage. Proposed budgets: initial route JS at most 150KB gzip and images above the fold at most 300KB total. Measure a production-like build on mobile; target Lighthouse performance at least 95 while retaining accessibility and visual quality.

Target good Core Web Vitals at the 75th percentile: LCP at most 2.5s, INP at most 200ms, CLS at most 0.1. New sites may lack enough field data; lab tests are an early check, not proof of field performance ([Web Vitals guidance](https://web.dev/articles/vitals)).

At launch, success means correct public rendering, crawl eligibility, useful metadata, working contact/resume paths, and a recruiter finding specialization and evidence within 30 seconds. Review indexing after launch, then evaluate name-query visibility and qualified recruiter conversations over subsequent weeks. Repeat a small fixed set of Google, ChatGPT-search, and Claude-search queries with dates and citation URLs; treat AI answers as variable observations, not a deterministic rank metric. Do not interpret missing analytics referrers as proof of no AI traffic. No scheduled monitoring is created here.

## Remaining decisions

Domain ownership/name, verified GitHub repository links, target roles within senior software engineering/applied ML, public email and sanitized PDF, publishable employer metrics, and factual case-study diagrams remain unresolved. These do not block building the layout with clearly marked local drafts; they gate publication of the affected content.
