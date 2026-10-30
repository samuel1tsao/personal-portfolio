import type { Project, Experience } from "./schema";

const ANCHOR_HASH_BITS = 64;
const ANCHOR_HASH_PRIME = 1099511628211n;
const ANCHOR_HASH_SEED = 14695981039346656037n;

export const detailPath = (item: Project | Experience) => {
  if ("project_id" in item) {
    return `/work/${item.project_id}`;
  }
  return `/experience/${item.experience_id}`;
};

export const detailAnchor = (text: string) =>
  `detail-${Array.from(text).reduce(hashCharacter, ANCHOR_HASH_SEED).toString(36)}`;

function hashCharacter(hash: bigint, character: string) {
  return BigInt.asUintN(
    ANCHOR_HASH_BITS,
    (hash ^ BigInt(character.codePointAt(0)!)) * ANCHOR_HASH_PRIME,
  );
}
