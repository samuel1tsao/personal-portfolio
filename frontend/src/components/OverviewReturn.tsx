"use client";

import { useEffect } from "react";

const RETURN_LINK_KEY = "portfolio-overview-return";
const DETAIL_LINKS = 'a[href^="/work/"], a[href^="/experience/"]';

function rememberLink(event: MouseEvent) {
  const link = (event.target as Element).closest<HTMLAnchorElement>(DETAIL_LINKS);
  try { if (link) sessionStorage.setItem(RETURN_LINK_KEY, link.getAttribute("href")!); } catch {}
}

function focusReturnLink() {
  try {
    const href = sessionStorage.getItem(RETURN_LINK_KEY);
    const link = Array.from(document.querySelectorAll<HTMLAnchorElement>(DETAIL_LINKS)).find((item) => item.getAttribute("href") === href);
    link?.focus({ preventScroll: true });
  } catch {}
}

function restoreOnBack(event?: PageTransitionEvent) {
  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
  if (event?.persisted || navigation?.type === "back_forward") focusReturnLink();
}

function observeReturn() {
  restoreOnBack();
  document.addEventListener("click", rememberLink);
  window.addEventListener("pageshow", restoreOnBack);
  return stopObserving;
}

function stopObserving() {
  document.removeEventListener("click", rememberLink);
  window.removeEventListener("pageshow", restoreOnBack);
}

export function OverviewReturn() {
  useEffect(observeReturn, []);
  return null;
}
