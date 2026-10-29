import type { PortfolioEntry } from "./schema";

export const OVERVIEW = "/resume";
export const SUMMARY_BULLET_LIMIT = 3;
export const detailPath = (entry: PortfolioEntry) =>
  `/${entry.kind === "project" ? "work" : "experience"}/${entry.slug}`;
export const detailAnchor = (text: string) =>
  `detail-${Array.from(text)
    .reduce(
      (hash, character) =>
        BigInt.asUintN(64, (hash ^ BigInt(character.codePointAt(0)!)) * 1099511628211n),
      14695981039346656037n,
    )
    .toString(36)}`;
