import type { Metadata } from "next";
import { Suspense } from "react";
import { Header, Footer } from "@/components/Shell";
import { FloatingChat } from "@/components/FloatingChat";
import { isChatEnabled } from "@/lib/chat";
import { pageMetadata } from "@/lib/seo";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = pageMetadata();

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body id="top">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        {children}
        <Footer />
        <Suspense fallback={null}>
          <FloatingChat enabled={isChatEnabled()} />
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
