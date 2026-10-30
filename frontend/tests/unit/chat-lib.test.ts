import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CHAT_OUTPUT_TOKENS,
  CHAT_TIMEOUT_MS,
  isChatEnabled,
  systemPrompt,
  toModelMessages,
} from "../../src/lib/chat";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("chat gateway configuration", () => {
  it("requires the explicit flag, server key, and a model identifier", () => {
    vi.stubEnv("CHAT_AGENT_ENABLED", "true");
    vi.stubEnv("AI_GATEWAY_API_KEY", "server-only-key");
    vi.stubEnv("AI_MODEL_FAST", "provider/model");
    expect(isChatEnabled()).toBe(true);

    vi.stubEnv("AI_MODEL_FAST", "invalid model");
    expect(isChatEnabled()).toBe(false);
  });

  it("converts validated text-only UI messages to model messages", () => {
    expect(
      toModelMessages([
        { id: "user-1", role: "user", parts: [{ type: "text", text: "Hello" }] },
        { id: "assistant-1", role: "assistant", parts: [{ type: "text", text: "Hi" }] },
      ]),
    ).toEqual([
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi" },
    ]);
    expect(CHAT_OUTPUT_TOKENS).toBe(512);
    expect(CHAT_TIMEOUT_MS).toBe(20_000);
  });
});

describe("chat instructions", () => {
  it("prioritizes contact facts and limits the assistant to published portfolio facts", async () => {
    const { readFileSync } = await import("node:fs");
    const fixture = JSON.parse(
      readFileSync(new URL("../../../backend/content/portfolio.json", import.meta.url), "utf8"),
    );
    const prompt = systemPrompt(fixture);
    expect(prompt).toContain(`Contact email: ${fixture.contact.email}`);
    expect(prompt).toContain("Use only the portfolio facts above.");
    expect(prompt).toContain("Do not invent outcomes");
    expect(prompt).toContain("Infrastructure Auto-Scaling for Burst Processing");
    expect(prompt).toContain("Solution: Upgraded the shared infrastructure library");
  });
});
