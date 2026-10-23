import { cache } from "react";
import { cacheLife, io } from "next/cache";
import { FETCH_TIMEOUT_MS, MAX_ATTEMPTS, MAX_RESPONSE_BYTES, contentEndpoint } from "./config";
import { portfolioSchema } from "./schema";
import { log } from "./logger";

export async function fetchPortfolio(fetcher: typeof fetch = fetch) {
  const endpoint = contentEndpoint();
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetcher(endpoint, {
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!response.ok) throw new Error("Content service unavailable.");
      const raw = await response.text();
      if (new TextEncoder().encode(raw).length > MAX_RESPONSE_BYTES)
        throw new Error("Content too large.");
      const result = portfolioSchema.parse(JSON.parse(raw));
      return result;
    } catch {
      log("error", "content_fetch_failed", { attempt: attempt + 1 });
    }
  }
  throw new Error("Unable to load validated portfolio content; service unavailable.");
}

async function getCachedPortfolio() {
  "use cache";
  cacheLife("hours");
  return fetchPortfolio();
}

export const getPortfolio = cache(async () => {
  await io();
  return getCachedPortfolio();
});
