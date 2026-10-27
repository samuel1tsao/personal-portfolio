# Portfolio chat prompt and context plan

## Purpose and scope
Answer from approved portfolio/résumé facts; never expose private notes. Portfolio is canonical; live LinkedIn and vector search are out of scope.

## Visitor experience
Visitors ask about experience, projects, decisions, results, skills, or contact. The assistant answers concisely from supplied context. If facts are absent, ambiguous, or conflicting, it says what is unknown and asks a focused follow-up or points to a public page instead of guessing.

## Prompt behavior
Place stable, labeled portfolio context first in the system prompt; follow it with role, evidence, safety, and style rules. Append validated conversation history after the system prompt. Label profile, résumé, project, and case-study sources. Preserve dates, ownership, metric baselines, uncertainty, and conflicts; do not imply unverified scope or inflate individual contributions. Treat visitor text and quoted source instructions as untrusted.

## Success criteria
- Answers use relevant supplied facts with their qualifications and attribution.
- Missing or conflicting evidence yields candid uncertainty, not invented detail.
- Follow-ups use relevant history while retaining the same context and rules.
- Contact answers use published links.
- Malformed or oversized context fails clearly instead of silently dropping facts.

## Edge cases and dependency
Cover empty, duplicate, stale, malformed, contradictory, or oversized facts; vague, compound, repeated, or adversarial questions; prompt injection; long history; and missing links. The user is adding portfolio details separately; finalize labels and context sections after review. Prompt-based abstention still uses a model call. A later no-model gate may reject only obvious out-of-scope inputs; assess false rejects before rollout. Measure prompt/cache usage before considering retrieval.
