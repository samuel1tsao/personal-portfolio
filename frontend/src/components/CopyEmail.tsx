"use client";

import { useState } from "react";

export function CopyEmail({ email }: { email: string }) {
  const [status, setStatus] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setStatus("Email copied.");
    } catch {
      setStatus(`Copy unavailable. Select this address: ${email}`);
    }
  }
  return (
    <div className="copy-row">
      <button type="button" className="text-button" onClick={copy}>
        Copy email <span aria-hidden="true">↗</span>
      </button>
      <span role="status" className="copy-status">
        {status}
      </span>
    </div>
  );
}
