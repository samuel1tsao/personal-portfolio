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

## Chat 400 follow-up

- DONE — Normalize SDK history before sending: text parts only, bounded history, complete turns, retry recovery. Files: ChatAgent and chat-history utility. Displayed replies retain their full text; only submitted context is shortened to the existing contract limits.
- DONE — Regression checks: SDK step metadata, long replies, repeated failed sends, Unicode byte limits, independent histories and unchanged source messages. All 45 unit tests pass; typecheck, lint and scoped formatting pass. Existing server-side validation remains strict.
- DONE — Verified port 3217 runs this repository's Next.js development server. Browser regression completes three turns with intercepted long SDK replies, validating every outgoing body against the server contract. No provider call was needed. Command: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3217 node node_modules/@playwright/test/cli.js test tests/e2e/chat-history.spec.ts` (1 passed).

Cause: SDK assistant messages can contain step metadata and multiple text parts, whereas the endpoint accepts one text part. Directly resubmitting SDK history fails validation; oversized replies and consecutive visitor turns after failures can do the same. Normalize the transport payload, preserving the UI conversation and existing server bounds. The browser regression initially counted Next.js's empty development alert; scope that assertion to the main content.

Follow-up retro: the previous chat-disabled UX checks could not detect an enabled multi-turn chat contract mismatch. The new intercepted-response regression covers that boundary without credentials or provider requests; no additional working-agreement change needed.

## Remaining live chat failure

- DONE — Local content service responds with 200; installed SDK streaming path passes a local mock-model integration test, covering actual stream conversion rather than intercepting the browser response.
- BLOCKED — Actual live failure remains unverified. Automatic approval review rejected a live diagnostic because it transmits context and may incur billing. User explicitly declined and requested local checks only. No live diagnostic was sent; do not retry without new authorization.
- DONE — Added allowlisted error names and numeric HTTP statuses to server diagnostics; arbitrary messages, prompts, keys, headers and provider response bodies remain excluded. SDK errors are now forwarded to this classifier. Simulated authentication errors retain their safe category while raw details stay out of the browser stream.
- DONE — Added safe-classification and actual SDK runtime tests. Local SDK integration succeeds for text output and error handling; typecheck passes. This establishes local behavior, not a successful provider response.

Port 3217 is the active development server; port 3219 is an older production preview launched with chat disabled. Live failures seen before this change were logged only as `upstream_error`, so the available historical logs cannot distinguish authentication, rate limits, invalid requests or other provider errors. Do not claim that this remaining failure has been fixed.

Retro: replaced an intercepted-browser-only assumption with SDK-level local integration coverage and safe failure metadata. No additional guidance edit needed.

## Chat API regression suite

- DONE — Added `frontend/tests/unit/chat-api.test.ts`: 18 offline integration regressions exercising the actual POST handler, history conversion, published-context prompt and SDK streaming. Mock only content loading, logging and the external model boundary; fail any attempted network call.
- DONE — Coverage: actual SSE headers/events and completion logging; normalized SDK metadata/long replies; failed-send retries; malformed JSON, null/missing/empty/blank/oversized messages; exact and exceeded UTF-8 body boundaries; disabled chat; content failure; authentication/rate-limit/timeout stream failures; partial-output failure; subsequent-request recovery; 20 concurrent independent streams. Existing route tests retain origin and media-type checks.
- DONE — Full local suite: 67 tests pass across 8 files. TypeScript, scoped ESLint, Prettier and diff whitespace checks pass. Run `node node_modules/vitest/vitest.mjs run tests/unit/chat-api.test.ts` from `frontend` for the focused suite; `npm test` runs the full unit/integration suite.

Provider verification remains excluded by user instruction. These regressions protect the local API/SDK contract and error paths; they do not establish that live credentials, billing, provider availability or the configured model currently work.

Retro: no new guidance needed; the offline API integration suite now covers the previously separated route and runtime boundaries without provider access.

## Chat scroll and composer layout

- DONE — Bound the chat frame, allocate remaining height to a keyboard-scrollable conversation, prevent message bubbles shrinking over the composer, and keep header/form outside the scroll area. Reserve scrollbar space, contain overscroll, prevent textarea resizing from crowding out history, and simplify the compact layout on short screens.
- DONE — Added `frontend/tests/e2e/chat-layout.spec.ts`: all 6 long-response tests pass across full-page/floating chat at 1440×900, 390×844 and 667×390. Checks stable composer position, transcript overflow, keyboard access to the final response line, follow-up input and no horizontal overflow. All provider replies intercepted; no external calls.
- DONE — Typecheck, scoped ESLint, Prettier and whitespace checks pass; existing multi-turn browser regression also passes. Runtime logic and server settings unchanged.

Cause: flex message bubbles could shrink and overflow their allocated area, while the outer chat frame did not consistently constrain the transcript. Fix confines scrolling to the conversation and reserves the header and form as non-shrinking siblings. The initial keyboard-scroll assertion needed to wait for native scroll completion; the final regression verifies the bottom is reached.

Use the updated development server at http://127.0.0.1:3217/. Port 3219 remains an older production preview and does not hot-reload source edits.

Retro: no working-agreement change needed; long-response viewport regressions now cover the layout behavior that short-response/API tests cannot establish.
