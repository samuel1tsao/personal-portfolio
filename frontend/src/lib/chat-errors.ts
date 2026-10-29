const ERROR_NAMES = new Set([
  "GatewayAuthenticationError",
  "GatewayForbiddenError",
  "GatewayInvalidRequestError",
  "GatewayRateLimitError",
  "GatewayModelNotFoundError",
  "GatewayTimeoutError",
  "GatewayInternalServerError",
  "GatewayFailedDependencyError",
  "GatewayResponseError",
  "AI_APICallError",
  "AbortError",
  "TimeoutError",
]);

export function chatFailureDetails(error: unknown) {
  const value = error && typeof error === "object" ? (error as Record<string, unknown>) : {};
  const kind =
    typeof value.name === "string" && ERROR_NAMES.has(value.name) ? value.name : "unknown";
  const status =
    typeof value.statusCode === "number" && value.statusCode >= 400 && value.statusCode <= 599
      ? value.statusCode
      : undefined;
  return { reason: "upstream_error", kind, ...(status ? { status } : {}) };
}
