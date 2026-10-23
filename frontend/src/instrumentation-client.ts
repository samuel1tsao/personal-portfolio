import { track } from "@vercel/analytics";

window.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;

  const target = event.target.closest<HTMLElement>("[data-analytics-event]");
  const eventName = target?.dataset.analyticsEvent;
  if (!eventName) return;

  const properties: Record<string, string> = {};
  const location = target.dataset.analyticsLocation;
  const eventTarget = target.dataset.analyticsTarget;
  if (location) properties.location = location;
  if (eventTarget) properties.target = eventTarget;
  track(eventName, properties);
});

let reportedClientError = false;

function reportClientError(kind: string) {
  if (reportedClientError) return;
  reportedClientError = true;
  track("FrontendError", { kind, route: window.location.pathname });
}

window.addEventListener("error", (event) => {
  if (event instanceof ErrorEvent) reportClientError("uncaught");
});

window.addEventListener("unhandledrejection", () => {
  reportClientError("unhandled_promise");
});
