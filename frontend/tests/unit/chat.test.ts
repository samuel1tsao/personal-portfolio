import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  MAX_CHAT_BODY_BYTES,
  MAX_CHAT_MESSAGES,
  chatRequestSchema,
} from "../../src/lib/chat-contract";

const fixture = JSON.parse(
  readFileSync(new URL("../../../backend/content/portfolio.json", import.meta.url), "utf8"),
);
const portfolio = {
  ...fixture,
  content_revision: createHash("sha256").update("chat-fixture").digest("hex"),
};
const origin = "http://portfolio.test";
const chatEndpoint = `${origin}/api/chat`;
const chatAnswer = "Samuel is working on applied ML projects.";

const getPortfolio = vi.fn();
const isChatEnabled = vi.fn();
const systemPrompt = vi.fn();
const toModelMessages = vi.fn();
const log = vi.fn();
const streamPortfolioChat = vi.fn();

vi.mock("@/lib/api", () => ({ getPortfolio }));
vi.mock("@/lib/chat", () => ({ isChatEnabled, systemPrompt, toModelMessages }));
vi.mock("@/lib/logger", () => ({ log }));
vi.mock("@/lib/chat-runtime", () => ({ streamPortfolioChat }));

function chatRequest(body: unknown, options: { origin?: string; contentType?: string } = {}) {
  const headers = new Headers({ "Content-Type": options.contentType || "application/json" });
  if (options.origin !== "") headers.set("Origin", options.origin || origin);
  return new Request(chatEndpoint, { method: "POST", headers, body: JSON.stringify(body) });
}

function message(role: "user" | "assistant", text: string, id = `${role}-${text}`) {
  return { id, role, parts: [{ type: "text" as const, text }] };
}

beforeEach(() => {
  getPortfolio.mockResolvedValue(portfolio);
  isChatEnabled.mockReturnValue(true);
  systemPrompt.mockReturnValue("portfolio context");
  toModelMessages.mockReturnValue([{ role: "user", content: "What projects are in progress?" }]);
  streamPortfolioChat.mockReturnValue(new Response(chatAnswer));
  vi.stubEnv("AI_MODEL_FAST", "provider/model");
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("chat contract", () => {
  it("accepts an alternating conversation ending with a visitor message", () => {
    const messages = [
      message("user", "What are you building?"),
      message("assistant", "I work across systems and ML."),
      message("user", "How can we connect?"),
    ];
    expect(chatRequestSchema.parse({ messages }).messages).toEqual(messages);
  });

  it.each([
    [message("assistant", "Hello")],
    [message("user", "Hello"), message("user", "Again")],
    Array.from({ length: MAX_CHAT_MESSAGES + 1 }, (_, index) =>
      message(index % 2 ? "assistant" : "user", "message", `message-${index}`),
    ),
  ])("rejects an unsafe message sequence", (messages) => {
    expect(chatRequestSchema.safeParse({ messages }).success).toBe(false);
  });

  it("rejects non-text message parts", () => {
    expect(
      chatRequestSchema.safeParse({
        messages: [
          {
            id: "user-tool",
            role: "user",
            parts: [{ type: "tool-invocation", toolCallId: "call-1", toolName: "lookup" }],
          },
        ],
      }).success,
    ).toBe(false);
  });
});

describe("portfolio chat route", () => {
  it("streams bounded visitor history with server-built context", async () => {
    const { POST } = await import("../../src/app/api/chat/route");
    const messages = [message("user", "What projects are in progress?")];
    const response = await POST(chatRequest({ messages }));

    expect(getPortfolio).toHaveBeenCalled();
    expect(systemPrompt).toHaveBeenCalled();
    expect(toModelMessages).toHaveBeenCalled();
    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe(chatAnswer);
    expect(systemPrompt).toHaveBeenCalledWith(portfolio);
    expect(toModelMessages).toHaveBeenCalledWith(messages);
    expect(streamPortfolioChat).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "provider/model",
        system: "portfolio context",
        messages: [{ role: "user", content: "What projects are in progress?" }],
      }),
    );
  });

  it.each([
    [
      "cross-origin",
      chatRequest(
        { messages: [{ role: "user", content: "Hello" }] },
        { origin: "https://other.test" },
      ),
      403,
    ],
    ["missing origin", chatRequest({ messages: [message("user", "Hello")] }, { origin: "" }), 403],
    [
      "wrong media type",
      chatRequest({ messages: [message("user", "Hello")] }, { contentType: "text/plain" }),
      415,
    ],
    ["invalid conversation", chatRequest({ messages: [message("assistant", "Hello")] }), 400],
  ])("rejects %s", async (_caseName, request, status) => {
    const { POST } = await import("../../src/app/api/chat/route");
    const response = await POST(request);
    expect(response.status).toBe(status);
    expect(streamPortfolioChat).not.toHaveBeenCalled();
  });

  it("rejects an oversized body before loading portfolio data", async () => {
    const { POST } = await import("../../src/app/api/chat/route");
    const body = "x".repeat(MAX_CHAT_BODY_BYTES + 1);
    const request = new Request(chatEndpoint, {
      method: "POST",
      headers: { Origin: origin, "Content-Type": "application/json" },
      body,
    });
    const response = await POST(request);
    expect(response.status).toBe(413);
    expect(getPortfolio).not.toHaveBeenCalled();
  });

  it("returns unavailable when disabled or content loading fails without logging content", async () => {
    const { POST } = await import("../../src/app/api/chat/route");
    isChatEnabled.mockReturnValueOnce(false);
    expect((await POST(chatRequest({ messages: [message("user", "Hello")] }))).status).toBe(503);

    getPortfolio.mockRejectedValueOnce(new Error("Gateway error: visitor prompt"));
    expect((await POST(chatRequest({ messages: [message("user", "Hello")] }))).status).toBe(503);
    expect(log).toHaveBeenCalledWith("error", "portfolio_chat_failed", {
      reason: "upstream_error",
    });
    expect(JSON.stringify(log.mock.calls)).not.toContain("visitor prompt");
  });

  it("keeps stream error handling free of visitor content", async () => {
    const { POST } = await import("../../src/app/api/chat/route");
    await POST(chatRequest({ messages: [message("user", "visitor prompt")] }));
    const options = streamPortfolioChat.mock.calls[0][0];

    options.onFailed();
    expect(log).toHaveBeenCalledWith("error", "portfolio_chat_failed", {
      reason: "upstream_error",
    });
    expect(JSON.stringify(log.mock.calls)).not.toContain("visitor prompt");
  });

  it("handles concurrent requests without sharing conversation state", async () => {
    const { POST } = await import("../../src/app/api/chat/route");
    const requests = Array.from({ length: 20 }, (_, index) =>
      POST(chatRequest({ messages: [message("user", `Question ${index}`)] })),
    );
    const responses = await Promise.all(requests);
    expect(responses.every((response) => response.status === 200)).toBe(true);
    expect(streamPortfolioChat).toHaveBeenCalledTimes(20);
  });
});
