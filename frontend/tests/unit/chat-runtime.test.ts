import { beforeEach, expect, it, vi } from "vitest";
import { MockLanguageModelV4 } from "ai/test";

const gateway = vi.hoisted(() => vi.fn());
vi.mock("@ai-sdk/gateway", () => ({ gateway }));

beforeEach(() => gateway.mockReset());

it("streams a complete local model response through the actual SDK", async () => {
  gateway.mockReturnValue(
    new MockLanguageModelV4({
      doStream: {
        stream: new ReadableStream({
          start(controller) {
            controller.enqueue({ type: "stream-start", warnings: [] });
            controller.enqueue({ type: "text-start", id: "answer" });
            controller.enqueue({ type: "text-delta", id: "answer", delta: "Local test answer" });
            controller.enqueue({ type: "text-end", id: "answer" });
            controller.enqueue({
              type: "finish",
              finishReason: { unified: "stop", raw: "stop" },
              usage: {
                inputTokens: { total: 1, noCache: 1, cacheRead: 0, cacheWrite: 0 },
                outputTokens: { total: 1, text: 1, reasoning: 0 },
              },
            });
            controller.close();
          },
        }),
      },
    }),
  );
  const { streamPortfolioChat } = await import("../../src/lib/chat-runtime");
  const onFailed = vi.fn();
  const onCompleted = vi.fn();
  const response = streamPortfolioChat({
    model: "local/test",
    system: "Local test",
    messages: [{ role: "user", content: "Hello" }],
    onFailed,
    onCompleted,
  });
  const body = await response.text();
  expect(body).toContain("Local test answer");
  expect(body).not.toContain('"type":"error"');
  expect(onCompleted).toHaveBeenCalledOnce();
  expect(onFailed).not.toHaveBeenCalled();
});

it("passes provider errors to safe diagnostics while keeping raw details out of the stream", async () => {
  const failure = Object.assign(new Error("private provider details"), {
    name: "GatewayAuthenticationError",
    statusCode: 401,
  });
  gateway.mockReturnValue(
    new MockLanguageModelV4({
      doStream: async () => {
        throw failure;
      },
    }),
  );
  const { streamPortfolioChat } = await import("../../src/lib/chat-runtime");
  const onFailed = vi.fn();
  const response = streamPortfolioChat({
    model: "local/test",
    system: "Local test",
    messages: [{ role: "user", content: "Hello" }],
    onFailed,
    onCompleted: vi.fn(),
  });
  const body = await response.text();
  expect(onFailed).toHaveBeenCalledWith(failure);
  expect(body).toContain("Chat is unavailable right now");
  expect(body).not.toContain("private provider details");
});
