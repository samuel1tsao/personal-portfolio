import { cache } from "react";
import {
  API_PATH,
  FETCH_TIMEOUT_MS,
  MAX_ATTEMPTS,
  MAX_RESPONSE_BYTES,
  validOrigin,
} from "./config";
import { portfolioSchema } from "./schema";
import { log } from "./logger";

export async function fetchPortfolio(fetcher: typeof fetch = fetch) {
  if (process.env.VERCEL && !process.env.CONTENT_API_URL) {
    throw new Error("CONTENT_API_URL is required on Vercel.");
  }
  const origin = validOrigin(
    process.env.CONTENT_API_URL || "http://127.0.0.1:8000",
    "CONTENT_API_URL",
  );
  const revision = process.env.CONTENT_REVISION;
  if (process.env.VERCEL && !revision) throw new Error("CONTENT_REVISION is required on Vercel.");
  const headers: Record<string, string> = {};
  const bypass = process.env.CONTENT_API_BYPASS_SECRET;
  if (bypass) headers["x-vercel-protection-bypass"] = bypass;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetcher(`${origin}${API_PATH}`, {
        headers,
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!response.ok) throw new Error("Content service unavailable.");
      const raw = await response.text();
      if (new TextEncoder().encode(raw).length > MAX_RESPONSE_BYTES)
        throw new Error("Content too large.");
      const result = portfolioSchema.parse(JSON.parse(raw));
      if (revision && result.content_revision !== revision)
        throw new Error("Content revision mismatch.");
      return result;
    } catch {
      log("error", "content_fetch_failed", { attempt: attempt + 1 });
    }
  }
  throw new Error("Unable to load validated portfolio content; deployment stopped.");
}

export const getPortfolio = cache(() => fetchPortfolio());
