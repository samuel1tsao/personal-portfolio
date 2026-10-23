import { NextResponse } from "next/server";
import { getPortfolio } from "@/lib/api";
import { isChatEnabled, systemPrompt, toModelMessages } from "@/lib/chat";
import { MAX_CHAT_BODY_BYTES, chatRequestSchema } from "@/lib/chat-contract";
import { log } from "@/lib/logger";
import { streamPortfolioChat } from "@/lib/chat-runtime";

const UNAVAILABLE_MESSAGE = "Chat is unavailable right now. Please use the contact links instead.";
const INVALID_MESSAGE = "Send a shorter message and try again.";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: INVALID_MESSAGE }, { status: 403 });
  if (!isChatEnabled()) return NextResponse.json({ error: UNAVAILABLE_MESSAGE }, { status: 503 });
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return NextResponse.json({ error: INVALID_MESSAGE }, { status: 415 });

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_CHAT_BODY_BYTES)
    return NextResponse.json({ error: INVALID_MESSAGE }, { status: 413 });

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: INVALID_MESSAGE }, { status: 400 });
  }
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: INVALID_MESSAGE }, { status: 400 });

  try {
    const portfolio = await getPortfolio();
    return streamPortfolioChat({
      model: process.env.AI_MODEL_FAST!,
      system: systemPrompt(portfolio),
      messages: toModelMessages(parsed.data.messages),
      onCompleted: () =>
        log("info", "portfolio_chat_completed", { messageCount: parsed.data.messages.length }),
      onFailed: () => log("error", "portfolio_chat_failed", { reason: "upstream_error" }),
    });
  } catch {
    log("error", "portfolio_chat_failed", {
      reason: "upstream_error",
    });
    return NextResponse.json({ error: UNAVAILABLE_MESSAGE }, { status: 503 });
  }
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    const requestUrl = new URL(request.url);
    const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0].trim();
    const host = forwardedHost || request.headers.get("host");
    const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0].trim();
    const protocol = forwardedProtocol ? `${forwardedProtocol}:` : requestUrl.protocol;
    const requestOrigin = host ? new URL(`${protocol}//${host}`).origin : requestUrl.origin;
    return new URL(origin).origin === requestOrigin;
  } catch {
    return false;
  }
}
