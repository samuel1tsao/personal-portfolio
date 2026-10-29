import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MockLanguageModelV4 } from "ai/test";
import type { UIMessage } from "ai";
import { prepareChatHistory } from "../../src/lib/chat-history";
import { MAX_CHAT_BODY_BYTES, MAX_CHAT_MESSAGE_CHARS } from "../../src/lib/chat-contract";

const mocks = vi.hoisted(() => ({ gateway: vi.fn(), getPortfolio: vi.fn(), log: vi.fn() }));
vi.mock("@ai-sdk/gateway", () => ({ gateway: mocks.gateway }));
vi.mock("@/lib/api", () => ({ getPortfolio: mocks.getPortfolio }));
vi.mock("@/lib/logger", () => ({ log: mocks.log }));

const fixture = JSON.parse(
  readFileSync(new URL("../../../backend/content/portfolio.json", import.meta.url), "utf8"),
);
const ORIGIN = "http://portfolio.test";
const ANSWER = "Local portfolio answer";
const PRIVATE_ERROR = "secret provider details and visitor content";
const noNetwork = vi.fn(() => {
  throw new Error("Network calls are forbidden in API regression tests");
});

const visitor = (text: string, id = "visitor"): UIMessage => ({
  id,
  role: "user",
  parts: [{ type: "text", text }],
});

function apiRequest(body: string, headers = {}) {
  return new Request(`${ORIGIN}/api/chat`, {
    method: "POST",
    headers: { origin: ORIGIN, "content-type": "application/json", ...headers },
    body,
  });
}

async function postMessages(messages: UIMessage[]) {
  const { POST } = await import("../../src/app/api/chat/route");
  return POST(apiRequest(JSON.stringify({ messages })));
}

function successfulModel() {
  return new MockLanguageModelV4({
    doStream: {
      stream: new ReadableStream({
        start(controller) {
          controller.enqueue({ type: "stream-start", warnings: [] });
          controller.enqueue({ type: "text-start", id: "answer" });
          controller.enqueue({ type: "text-delta", id: "answer", delta: ANSWER });
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
  });
}

beforeEach(() => {
  mocks.gateway.mockReset().mockImplementation(successfulModel);
  mocks.getPortfolio.mockReset().mockResolvedValue(fixture);
  mocks.log.mockReset();
  noNetwork.mockClear();
  vi.stubGlobal("fetch", noNetwork);
  vi.stubEnv("CHAT_AGENT_ENABLED", "true");
  vi.stubEnv("AI_GATEWAY_API_KEY", "local-test-only");
  vi.stubEnv("AI_MODEL_FAST", "local/test");
});

afterEach(() => {
  expect(noNetwork).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("chat API integration regressions (offline)", () => {
  it("builds real portfolio context and streams SDK events from the route", async () => {
    const model = successfulModel();
    mocks.gateway.mockReturnValue(model);
    const response = await postMessages([visitor("What projects are you working on?")]);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/event-stream");
    expect(response.headers.get("x-vercel-ai-ui-message-stream")).toBe("v1");
    expect(await response.text()).toContain(ANSWER);
    expect(mocks.log).toHaveBeenCalledWith("info", "portfolio_chat_completed", { messageCount: 1 });
    expect(JSON.stringify(model.doStreamCalls[0].prompt)).toContain(fixture.profile.name);
    expect(JSON.stringify(model.doStreamCalls[0].prompt)).toContain(
      "What projects are you working on?",
    );
  });

  it("accepts normalized SDK follow-ups with step metadata and long assistant replies", async () => {
    const history: UIMessage[] = [
      visitor("First question"),
      {
        id: "answer",
        role: "assistant",
        parts: [{ type: "step-start" }, { type: "text", text: "a".repeat(2000) }],
      },
      visitor("Follow-up", "follow-up"),
    ];
    expect((await postMessages(history)).status).toBe(400);
    expect(mocks.gateway).not.toHaveBeenCalled();
    const response = await postMessages(prepareChatHistory(history));
    expect(response.status).toBe(200);
    expect(await response.text()).toContain(ANSWER);
  });

  it("accepts retry recovery after failed consecutive visitor sends", async () => {
    const response = await postMessages(
      prepareChatHistory([visitor("Failed"), visitor("Retry", "retry")]),
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toContain(ANSWER);
  });

  it.each([
    "{",
    "null",
    "{}",
    '{"messages":[]}',
    JSON.stringify({ messages: [visitor(" ")] }),
    JSON.stringify({ messages: [visitor("a".repeat(MAX_CHAT_MESSAGE_CHARS + 1))] }),
  ])("rejects malformed or invalid body before dependencies: %s", async (body) => {
    const { POST } = await import("../../src/app/api/chat/route");
    expect((await POST(apiRequest(body))).status).toBe(400);
    expect(mocks.getPortfolio).not.toHaveBeenCalled();
    expect(mocks.gateway).not.toHaveBeenCalled();
  });

  it("enforces the body limit in UTF-8 bytes", async () => {
    const { POST } = await import("../../src/app/api/chat/route");
    const body = JSON.stringify({
      messages: [visitor("Hello")],
      padding: "界".repeat(Math.ceil(MAX_CHAT_BODY_BYTES / 3)),
    });
    expect(body.length).toBeLessThan(MAX_CHAT_BODY_BYTES);
    expect((await POST(apiRequest(body))).status).toBe(413);
    expect(mocks.getPortfolio).not.toHaveBeenCalled();
  });

  it("accepts the exact body byte boundary", async () => {
    const { POST } = await import("../../src/app/api/chat/route");
    const body = JSON.stringify({ messages: [visitor("Hello")] });
    const response = await POST(apiRequest(body.padEnd(MAX_CHAT_BODY_BYTES, " ")));
    expect(response.status).toBe(200);
    expect(await response.text()).toContain(ANSWER);
  });

  it("fails closed when disabled or content is unavailable", async () => {
    vi.stubEnv("CHAT_AGENT_ENABLED", "false");
    expect((await postMessages([visitor("Hello")])).status).toBe(503);
    expect(mocks.getPortfolio).not.toHaveBeenCalled();
    vi.stubEnv("CHAT_AGENT_ENABLED", "true");
    mocks.getPortfolio.mockRejectedValue(new Error(PRIVATE_ERROR));
    const response = await postMessages([visitor("Hello")]);
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain(PRIVATE_ERROR);
    expect(mocks.gateway).not.toHaveBeenCalled();
  });

  it.each([
    ["GatewayAuthenticationError", 401],
    ["GatewayRateLimitError", 429],
    ["GatewayTimeoutError", 504],
  ])("handles %s after the stream starts without leaking details", async (name, statusCode) => {
    const failure = Object.assign(new Error(PRIVATE_ERROR), { name, statusCode });
    mocks.gateway.mockReturnValue(
      new MockLanguageModelV4({
        doStream: async () => {
          throw failure;
        },
      }),
    );
    const response = await postMessages([visitor("Hello")]);
    expect(response.status).toBe(200);
    const body = await response.text();
    expect(body).toContain('"type":"error"');
    expect(body).toContain("Chat is unavailable right now");
    expect(body).not.toContain(PRIVATE_ERROR);
    expect(mocks.log).toHaveBeenCalledWith("error", "portfolio_chat_failed", {
      reason: "upstream_error",
      kind: name,
      status: statusCode,
    });
    expect(mocks.log).not.toHaveBeenCalledWith(
      "info",
      "portfolio_chat_completed",
      expect.anything(),
    );
    expect(JSON.stringify(mocks.log.mock.calls)).not.toContain(PRIVATE_ERROR);
  });

  it("returns a safe error if a provider stream fails after partial output", async () => {
    const failure = Object.assign(new Error(PRIVATE_ERROR), {
      name: "GatewayTimeoutError",
      statusCode: 504,
    });
    mocks.gateway.mockReturnValue(
      new MockLanguageModelV4({
        doStream: {
          stream: new ReadableStream({
            start(controller) {
              controller.enqueue({ type: "stream-start", warnings: [] });
              controller.enqueue({ type: "text-start", id: "partial" });
              controller.enqueue({ type: "text-delta", id: "partial", delta: "Partial answer" });
              controller.enqueue({ type: "error", error: failure });
              controller.close();
            },
          }),
        },
      }),
    );
    const response = await postMessages([visitor("Hello")]);
    const body = await response.text();
    expect(body).toContain("Partial answer");
    expect(body).toContain("Chat is unavailable right now");
    expect(body).not.toContain(PRIVATE_ERROR);
    expect(mocks.log).toHaveBeenCalledWith("error", "portfolio_chat_failed", {
      reason: "upstream_error",
      kind: "GatewayTimeoutError",
      status: 504,
    });
  });

  it("recovers on the next request after a failed stream", async () => {
    mocks.gateway.mockReturnValueOnce(
      new MockLanguageModelV4({
        doStream: async () => {
          throw new Error(PRIVATE_ERROR);
        },
      }),
    );
    expect(await (await postMessages([visitor("First")])).text()).toContain('"type":"error"');
    const response = await postMessages([visitor("Retry", "retry")]);
    expect(response.status).toBe(200);
    const body = await response.text();
    expect(body).toContain(ANSWER);
    expect(body).not.toContain('"type":"error"');
  });

  it("keeps concurrent streamed requests and repeated histories independent", async () => {
    const models: MockLanguageModelV4[] = [];
    mocks.gateway.mockImplementation(() => {
      const model = successfulModel();
      models.push(model);
      return model;
    });
    const bodies = await Promise.all(
      Array.from({ length: 20 }, async (_, index) => {
        const response = await postMessages([visitor(`Question ${index}`)]);
        expect(response.status).toBe(200);
        return response.text();
      }),
    );
    expect(bodies.every((body) => body.includes(ANSWER))).toBe(true);
    const prompts = models.map((model) => JSON.stringify(model.doStreamCalls[0].prompt));
    for (let index = 0; index < 20; index++)
      expect(prompts.filter((prompt) => prompt.includes(`Question ${index}\"`))).toHaveLength(1);
  });
});
