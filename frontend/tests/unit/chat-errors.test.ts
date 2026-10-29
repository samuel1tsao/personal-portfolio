import { expect, it } from "vitest";
import { chatFailureDetails } from "../../src/lib/chat-errors";

it("records safe provider error classification without messages or request payloads", () => {
  expect(
    chatFailureDetails({
      name: "GatewayAuthenticationError",
      statusCode: 401,
      message: "secret",
      requestBody: "visitor text",
      headers: { authorization: "secret" },
    }),
  ).toEqual({ reason: "upstream_error", kind: "GatewayAuthenticationError", status: 401 });
});

it("does not log arbitrary error names or invalid status values", () => {
  for (const error of [null, "secret", { name: "visitor text", statusCode: 999 }]) {
    expect(chatFailureDetails(error)).toEqual({ reason: "upstream_error", kind: "unknown" });
  }
});
