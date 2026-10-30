import type { Metadata } from "next";
import { ChatAgent } from "@/components/ChatAgent";
import { getPortfolio } from "@/lib/api";
import { isChatEnabled } from "@/lib/chat";
import { pageMetadata } from "@/lib/seo";
import styles from "./ChatPage.module.css";

export const metadata: Metadata = pageMetadata(
  "Chat about Samuel Tsao | Portfolio",
  "Ask about Samuel's experience, projects, and ways to connect.",
  "/chat",
);
export const instant = false;

export default async function ChatPage() {
  const portfolio = await getPortfolio();
  const links = [
    { label: "GitHub", url: portfolio.contact.github_url },
    { label: "LinkedIn", url: portfolio.contact.linkedin_url },
  ];
  return (
    <main id="main" className={`wrap ${styles.page}`}>
      <p className="eyebrow">A little more about my work</p>
      <h1>Ask me about what I’m building.</h1>
      <p className={styles.lede}>
        Explore my experience and published projects, or find the best way to connect.
      </p>
      <ChatAgent enabled={isChatEnabled()} email={portfolio.contact.email} links={links} />
    </main>
  );
}
