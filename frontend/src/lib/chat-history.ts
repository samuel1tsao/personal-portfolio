import type { UIMessage } from "ai";
import {
  type ChatMessage,
  MAX_CHAT_BODY_BYTES,
  MAX_CHAT_MESSAGE_CHARS,
  MAX_CHAT_MESSAGES,
  MAX_CHAT_TOTAL_CHARS,
} from "./chat-contract";

function textMessage(message: UIMessage): ChatMessage | null {
  const text = message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("")
    .trim();
  if (!text || message.role === "system") return null;
  return {
    id: message.id,
    role: message.role,
    parts: [{ type: "text", text: text.slice(0, MAX_CHAT_MESSAGE_CHARS) }],
  };
}

function appendTurn(history: ChatMessage[], message: ChatMessage) {
  if (!history.length && message.role !== "user") return;
  if (history.at(-1)?.role === message.role) history.pop();
  history.push(message);
}

function historyFits(messages: ChatMessage[]) {
  const characters = messages.reduce((total, message) => total + message.parts[0].text.length, 0);
  const bytes = new TextEncoder().encode(JSON.stringify({ messages })).byteLength;
  return (
    messages.length <= MAX_CHAT_MESSAGES &&
    characters <= MAX_CHAT_TOTAL_CHARS &&
    bytes <= MAX_CHAT_BODY_BYTES
  );
}

export function prepareChatHistory(messages: UIMessage[]): ChatMessage[] {
  const history: ChatMessage[] = [];
  for (const message of messages) {
    const normalized = textMessage(message);
    if (normalized) appendTurn(history, normalized);
  }
  while (!historyFits(history) && history.length > 1) history.splice(0, 2);
  return history;
}
