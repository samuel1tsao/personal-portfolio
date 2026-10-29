import { describe, expect, it } from "vitest";
import type { UIMessage } from "ai";
import { prepareChatHistory } from "../../src/lib/chat-history";
import { chatRequestSchema, MAX_CHAT_BODY_BYTES } from "../../src/lib/chat-contract";

const message = (role: "user" | "assistant", text: string, id = `${role}-id`): UIMessage => ({
  id,
  role,
  parts: [{ type: "text", text }],
});

describe("outgoing chat history", () => {
  it("normalizes SDK step metadata and multiple text parts before a follow-up", () => {
    const messages: UIMessage[] = [
      message("user", "What projects have you built?"),
      {
        id: "answer",
        role: "assistant",
        parts: [
          { type: "step-start" },
          { type: "text", text: "Software " },
          { type: "text", text: "and ML." },
        ],
      },
      message("user", "Tell me more.", "follow-up"),
    ];
    expect(chatRequestSchema.safeParse({ messages }).success).toBe(false);
    const history = prepareChatHistory(messages);
    expect(chatRequestSchema.safeParse({ messages: history }).success).toBe(true);
    expect(history[1].parts).toEqual([{ type: "text", text: "Software and ML." }]);
    expect(messages[1].parts).toHaveLength(3);
  });

  it("keeps a valid follow-up after an answer longer than the per-message limit", () => {
    const history = prepareChatHistory([
      message("user", "Hello"),
      message("assistant", "a".repeat(3000)),
      message("user", "More?", "next"),
    ]);
    expect(chatRequestSchema.safeParse({ messages: history }).success).toBe(true);
    expect(history.at(-1)?.parts[0].text).toBe("More?");
  });

  it("recovers after failed sends without consecutive visitor messages", () => {
    const history = prepareChatHistory([
      message("user", "Failed"),
      message("user", "Retry", "retry"),
      { id: "empty", role: "assistant", parts: [{ type: "step-start" }] },
      message("user", "Try again", "last"),
    ]);
    expect(history).toEqual([message("user", "Try again", "last")]);
    expect(chatRequestSchema.safeParse({ messages: history }).success).toBe(true);
  });

  it.each(["a", "界", "😀"])("bounds long histories by count, characters and bytes: %s", (text) => {
    const messages = Array.from({ length: 25 }, (_, index) =>
      message(index % 2 ? "assistant" : "user", text.repeat(1000), `id-${index}`),
    );
    const history = prepareChatHistory(messages);
    expect(chatRequestSchema.safeParse({ messages: history }).success).toBe(true);
    expect(
      new TextEncoder().encode(JSON.stringify({ messages: history })).byteLength,
    ).toBeLessThanOrEqual(MAX_CHAT_BODY_BYTES);
    expect(history[0].role).toBe("user");
    expect(history.at(-1)?.id).toBe("id-24");
  });

  it("does not share state between repeated or independent requests", () => {
    const first = [message("user", "First")];
    expect(prepareChatHistory(first)).toEqual(prepareChatHistory(first));
    expect(prepareChatHistory([message("user", "Second")])[0].parts[0].text).toBe("Second");
    expect(prepareChatHistory(first)[0].parts[0].text).toBe("First");
  });
});
