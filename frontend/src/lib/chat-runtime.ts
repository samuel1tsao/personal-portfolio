import { gateway } from "@ai-sdk/gateway";
import {
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type ModelMessage,
} from "ai";
import { CHAT_OUTPUT_TOKENS, CHAT_TIMEOUT_MS } from "./chat";

const UNAVAILABLE_MESSAGE = "Chat is unavailable right now. Please use the contact links instead.";

export function streamPortfolioChat({
  model,
  system,
  messages,
  onCompleted,
  onFailed,
}: {
  model: string;
  system: string;
  messages: ModelMessage[];
  onCompleted: () => void;
  onFailed: () => void;
}): Response {
  const result = streamText({
    model: gateway(model),
    system,
    messages,
    reasoning: "minimal",
    maxOutputTokens: CHAT_OUTPUT_TOKENS,
    maxRetries: 0,
    timeout: CHAT_TIMEOUT_MS,
    onError: onFailed,
    onFinish: ({ finishReason }) => {
      if (finishReason !== "error") onCompleted();
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      onError: () => UNAVAILABLE_MESSAGE,
    }),
  });
}
