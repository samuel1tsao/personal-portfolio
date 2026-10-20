import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="not-found wrap">
      <p className="eyebrow">404 / A different path</p>
      <h1>This page isn’t here.</h1>
      <p>Explore the selected work or head back to the homepage.</p>
      <Link className="button primary" href="/">
        Back to home ↗
      </Link>
    </main>
  );
}
