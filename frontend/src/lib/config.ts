export const SITE_NAME = "Samuel Tsao";
export const SITE_TITLE = "Samuel Tsao | Senior Software Engineer & Applied ML";
export const SITE_DESCRIPTION =
  "Software engineering across financial technology, marketplaces, and cloud infrastructure. Explore Samuel Tsao's experience and applied ML projects.";
export const API_PATH = "/api/v1/portfolio";
export const FETCH_TIMEOUT_MS = 5000;
export const MAX_RESPONSE_BYTES = 200_000;
export const MAX_ATTEMPTS = 2;
export const isIndexable =
  process.env.SITE_INDEXABLE === "true" &&
  (!process.env.VERCEL || process.env.VERCEL_ENV === "production");

export function validOrigin(value: string, name: string): string {
  const url = new URL(value);
  const local = ["localhost", "127.0.0.1"].includes(url.hostname);
  if (
    !(url.protocol === "https:" || (local && url.protocol === "http:")) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(`${name} must be a clean HTTPS origin (HTTP allowed locally).`);
  }
  return url.origin;
}

export function siteOrigin(): string {
  const value = process.env.SITE_URL;
  if (!value && process.env.VERCEL) throw new Error("SITE_URL is required on Vercel.");
  return validOrigin(value || "http://127.0.0.1:3000", "SITE_URL");
}
