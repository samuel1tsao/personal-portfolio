import { z } from "zod";

export const MAX_CHAT_MESSAGES = 9;
export const MAX_CHAT_MESSAGE_CHARS = 1000;
export const MAX_CHAT_TOTAL_CHARS = 4000;
export const MAX_CHAT_BODY_BYTES = 10_000;

export const chatMessageSchema = z.object({
  id: z.string().min(1).max(128),
  role: z.enum(["user", "assistant"]),
  parts: z
    .array(
      z.object({
        type: z.literal("text"),
        text: z.string().trim().min(1).max(MAX_CHAT_MESSAGE_CHARS),
      }),
    )
    .length(1),
});

export const chatRequestSchema = z
  .object({ messages: z.array(chatMessageSchema).min(1).max(MAX_CHAT_MESSAGES) })
  .refine(({ messages }) => {
    const size = messages.reduce((total, message) => total + message.parts[0].text.length, 0);
    const alternating = messages.every(
      (message, index) => message.role === (index % 2 ? "assistant" : "user"),
    );
    return size <= MAX_CHAT_TOTAL_CHARS && alternating && messages.at(-1)?.role === "user";
  });

export type ChatMessage = z.infer<typeof chatMessageSchema>;
