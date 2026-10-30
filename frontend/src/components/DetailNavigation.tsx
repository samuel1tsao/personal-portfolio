"use client";

import { useEffect } from "react";
import type { Project, Experience } from "@/lib/schema";
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

export function DetailNavigation({ item }: { item: Project | Experience }) {
  const itemId = "project_id" in item ? item.project_id : item.experience_id;
  useEffect(observeTarget, [itemId]);

  const targets =
    "project_id" in item
      ? [
          ["problem", "Problem"],
          ["solution", "Solution"],
          ["impact", "Impact & accomplishments"],
        ]
      : item.projects.map((project) => [detailAnchor(project.title), project.title]);

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
