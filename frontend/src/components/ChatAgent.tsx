"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useRef, useState, type FormEvent } from "react";
import { prepareChatHistory } from "@/lib/chat-history";
import styles from "./ChatAgent.module.css";

type ContactLink = { label: string; url: string };

const SUGGESTIONS = [
  "What kinds of projects are you working on?",
  "Tell me about your applied ML work.",
  "How can I get in touch?",
];
const WELCOME = "Hi! Ask about my experience, projects, or how we could connect.";
const MAX_VISIBLE_MESSAGES = 25;
const chatTransport = new DefaultChatTransport({
  api: "/api/chat",
  prepareSendMessagesRequest: ({ messages }) => ({
    body: { messages: prepareChatHistory(messages) },
  }),
});

function messageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function ChatAgent({
  enabled,
  email,
  links,
  compact = false,
  onClose,
}: {
  enabled: boolean;
  email?: string;
  links?: ContactLink[];
  compact?: boolean;
  onClose?: () => void;
}) {
  const { messages, status, error, sendMessage, clearError } = useChat({
    transport: chatTransport,
  });
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sending = status === "submitted" || status === "streaming";
  const visibleMessages = messages.slice(-MAX_VISIBLE_MESSAGES);

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = input.trim();
    if (!content || sending || !enabled) return;
    setInput("");
    clearError();

    try {
      await sendMessage({ text: content });
    } finally {
      inputRef.current?.focus();
    }
  }

  return (
    <div className={compact ? `${styles.layout} ${styles.compactLayout}` : styles.layout}>
      <section
        className={compact ? `${styles.chat} ${styles.compactChat}` : styles.chat}
        aria-label="Chat with Samuel's portfolio assistant"
      >
        <div className={styles.chatHeader}>
          <span className="status-dot" aria-hidden="true" />
          <div>
            <h2>Portfolio assistant</h2>
            <p>
              {enabled
                ? "Answers from published portfolio details"
                : "Chat is currently unavailable"}
            </p>
          </div>
          {onClose && (
            <button
              className={styles.closeButton}
              type="button"
              onClick={onClose}
              aria-label="Close chat"
            >
              ×
            </button>
          )}
        </div>
        <ol
          className={compact ? `${styles.messages} ${styles.compactMessages}` : styles.messages}
          aria-label="Conversation"
          aria-live="polite"
          tabIndex={0}
        >
          {messages.length === 0 && (
            <li className={styles.assistantMessage}>
              <span className={styles.messageRole}>Assistant</span>
              <p>{WELCOME}</p>
            </li>
          )}
          {visibleMessages.map((message) => (
            <li
              key={message.id}
              className={message.role === "user" ? styles.userMessage : styles.assistantMessage}
            >
              <span className={styles.messageRole}>
                {message.role === "user" ? "You" : "Assistant"}
              </span>
              {messageText(message) && <p>{messageText(message)}</p>}
            </li>
          ))}
          {sending && (
            <li className={styles.pending} role="status">
              Thinking…
            </li>
          )}
        </ol>
        {error && (
          <p className={styles.error} role="alert">
            I couldn’t answer just now. You can reach me directly below.
          </p>
        )}
        {!enabled && (
          <p className={styles.notice}>Use the contact links to reach Samuel directly.</p>
        )}
        {messages.length === 0 && enabled && (
          <div className={styles.suggestions} aria-label="Suggested questions">
            {SUGGESTIONS.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => setInput(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
        )}
        <form className={styles.form} onSubmit={submitMessage}>
          <label htmlFor="chat-message">Your question</label>
          <textarea
            ref={inputRef}
            id="chat-message"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="Ask about my work…"
            disabled={!enabled || sending}
          />
          <div className={styles.formFooter}>
            <span>Messages go to the AI service; this site does not save chat history.</span>
            <button
              className="button primary"
              type="submit"
              disabled={!enabled || sending || !input.trim()}
            >
              {sending ? "Sending…" : "Send"} <span aria-hidden="true">↗</span>
            </button>
          </div>
        </form>
      </section>
      {!compact && (
        <aside className={styles.contact} aria-labelledby="chat-contact-heading">
          <p className="eyebrow">Prefer a direct conversation?</p>
          <h2 id="chat-contact-heading">Let’s connect.</h2>
          {email && (
            <a href={`mailto:${email}`} className={styles.contactLink}>
              {email} ↗
            </a>
          )}
          {links?.map((link) => (
            <a key={link.url} href={link.url} className={styles.contactLink}>
              {link.label} ↗
            </a>
          ))}
        </aside>
      )}
    </div>
  );
}
