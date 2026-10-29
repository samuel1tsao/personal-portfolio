"use client";

import { useEffect } from "react";
import type { PortfolioEntry } from "@/lib/schema";
import { detailAnchor } from "@/lib/detail-links";

function focusTarget() {
  const target = document.getElementById(location.hash.slice(1));
  if (target) target.focus({ preventScroll: true });
}

function observeTarget() {
  focusTarget();
  window.addEventListener("hashchange", focusTarget);
  return () => window.removeEventListener("hashchange", focusTarget);
}

// JSX components follow the existing component-length exception in Shell.tsx.
export function DetailNavigation({ entry }: { entry: PortfolioEntry }) {
  useEffect(observeTarget, [entry.slug]);
  const targets =
    entry.kind === "project"
      ? [
          ["problem", "Problem"],
          ["solution", "Solution"],
          ["impact", "Impact & accomplishments"],
        ]
      : entry.work_projects.map((project) => [detailAnchor(project.title), project.title]);
  if (!targets.length) return null;
  return (
    <nav className="overview-nav" aria-label="On this page">
      {targets.map(([id, title]) => (
        <a key={id} href={`#${id}`}>
          {title}
        </a>
      ))}
    </nav>
  );
}
