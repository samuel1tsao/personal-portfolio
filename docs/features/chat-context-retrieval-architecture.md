# Chat retrieval architecture

**Status:** Proposed. Pricing checked 2026-10-26.

## Recommendation
For the first phase, use the full approved portfolio context in `portfolio.json`; no vector database or live LinkedIn connection is needed. Include reviewed résumé facts, project accomplishments, published case-study sections, decisions, evidence, and a concise professional-statement summary. Context is bounded at 64,000 characters and fails visibly instead of being silently cut mid-fact. Vercel has no first-party vector DB.

## If full context becomes too costly
The current context is about 46,000 characters (roughly 11,500 tokens); history is added after it. Gateway prompt caching is enabled with `caching: "auto"`, but requests still carry the context and cached input is not free. Measure cache-read tokens and cost for the actual model/provider. If one-shot cost or missed paraphrases become a problem, compare Postgres full-text search first; add `pgvector` only if evaluation shows a worthwhile recall gain. Neon includes `pgvector` on Free and can be connected through Vercel Marketplace.

### Retrieval settings if needed
- Split at document/heading/paragraph/bullet boundaries; keep labels and table rows intact. Target **350–500 tokens/chunk**, **50–75 token overlap** for long prose; repair chunks over 700 tokens.
- Store text, source ID/title/section/URL, published flag, revision hash, timestamps, and embedding model/version. Exclude private/draft content; treat embedded instructions as untrusted.
- Retrieve top 8 vector + 8 lexical; fuse/deduplicate; pass at most 4 passages (~1,800 tokens). Calibrate evidence floor on reviewed examples; cosine cutoffs are model-specific.
- Abstain out of scope, below evidence floor, or on material conflicts, before `streamPortfolioChat`. Log decision/source IDs/score band/latency/usage, never raw questions or secrets.

## Free-tier fit and inference cost
Vercel Hobby includes 1M function calls/month, 4 active CPU-hours, 360 GB-hours memory. Neon Free includes 1 GB/project, 100 CU-hours/month, scales to zero after 5 idle minutes. This can be **$0 within quotas**, with cold starts and no production SLA.

AI Gateway includes $5/month free-tier credits and supports embeddings. Embeddings are billed at the selected model/provider rate: skipping generation does not eliminate inference. Embed static chunks once per changed revision; embed each in-scope query. Abstention saves completion cost, while semantic retrieval still uses a query embedding. Scope/keyword checks can reject obvious off-topic inputs free but miss paraphrases. Track costs; no auto-top-up.

## Conversation history and prompt caching
Current `/api/chat` resends the system prompt and full validated history every turn (max 9 messages/4,000 chat characters; portfolio context max 64,000 characters). Put stable portfolio context first in the system prefix, followed by fixed role, evidence, safety, and answer-style rules; conversation messages follow. No server-side conversation state exists. Provider KV caching can reuse an identical prefix, reducing prefill work and often input price; requests still include context and cached tokens are not free. Cache is provider/model-specific, short-lived, and needs matching prefixes. Verify `cacheReadTokens` and cost. Live LinkedIn retrieval is out of scope.

## Flow and proposed changes
The owner reviews and publishes portfolio facts as the canonical source. `/api/chat` validates the request and supplies the bounded context, instructions, and relevant conversation history to the model. The assistant expresses uncertainty when the context does not support an answer. A deterministic preflight can be evaluated later for clearly out-of-scope questions; it should not claim to verify nuanced evidence without model inference. No external source freshness or OAuth state is involved.

Touch `frontend/src/app/api/chat/route.ts`, `frontend/src/lib/chat.ts`, and `frontend/src/lib/chat-runtime.ts`; add server-only retrieval, SQL migration, ingestion script, and secret settings. Public pages stay DB-independent.

## Evaluation and rollout
Compare full-context answers on reviewed facts, paraphrases, unsupported questions, conflicts, and prompt injection. Track evidence and abstention precision, avoided completions, latency, and cost. If retrieval is later added, test stale/changed indexes, provider/DB failures, and concurrent updates. Require an accuracy gain without more unsupported answers.

## References
[Vercel Hobby](https://vercel.com/docs/plans/hobby) · [Neon pricing](https://neon.com/pricing) · [pgvector](https://neon.com/docs/extensions/pgvector) · [Gateway caching](https://vercel.com/docs/ai-gateway/models-and-providers/provider-options)
