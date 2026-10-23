"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChatAgent } from "./ChatAgent";
import styles from "./FloatingChat.module.css";

export function FloatingChat({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  if (pathname === "/chat") return null;

  return (
    <div className={styles.floatingChat}>
      <section
        className={styles.panel}
        id="floating-chat-panel"
        aria-label="Portfolio assistant chat"
        hidden={!open}
      >
        <ChatAgent
          enabled={enabled}
          compact
          onClose={() => {
            setOpen(false);
            toggleRef.current?.focus();
          }}
        />
      </section>
      <button
        ref={toggleRef}
        className={styles.toggle}
        type="button"
        aria-expanded={open}
        aria-controls="floating-chat-panel"
        aria-label={open ? "Close chat" : "Open chat"}
        onClick={() => setOpen((current) => !current)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M4 5.75A2.75 2.75 0 0 1 6.75 3h10.5A2.75 2.75 0 0 1 20 5.75v7.5A2.75 2.75 0 0 1 17.25 16H10l-5 4v-4.25A2.75 2.75 0 0 1 4 13.5z" />
        </svg>
        <span>{open ? "Close" : "Ask me"}</span>
      </button>
    </div>
  );
}
