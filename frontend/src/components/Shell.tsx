import Link from "next/link";
import packageInfo from "../../package.json";

const NAVIGATION = [
  { label: "Home", href: "/" },
  { label: "Resume & Work", href: "/resume" },
  { label: "Ask me", href: "/chat" },
];

export function Header() {
  // Component lengths follow the readability exception approved on 2026-10-20.
  return (
    <header className="site-header wrap">
      <Link href="/" className="wordmark" aria-label="ST. — Samuel Tsao home">
        ST<span>.</span>
      </Link>
      <nav aria-label="Main navigation">
        {NAVIGATION.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
        <Link href="/#connect" className="nav-connect">
          Let’s connect <span aria-hidden="true">↗</span>
        </Link>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer wrap">
      <p>
        Samuel Tsao <span className="muted">/ Software engineer</span>
      </p>
      <p className="muted">v{packageInfo.version}</p>
      <a href="#top">Back to top ↑</a>
    </footer>
  );
}
