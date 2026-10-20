import type { Metadata } from "next";
import { Header, Footer } from "@/components/Shell";
import { pageMetadata } from "@/lib/seo";
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
      </body>
    </html>
  );
}
