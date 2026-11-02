import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="page shell">
      <div className="empty">
        <div style={{ fontSize: 70 }} aria-hidden="true">🎬</div>
        <span className="eyebrow">Scene not found</span>
        <h1 className="page-title">Looks like we're off set.</h1>
        <p className="muted">
          The page you're looking for may have moved or wrapped for the day.
        </p>
        <Link href="/" className="btn btn-dark">Return to home ↗</Link>
      </div>
    </main>
  );
}
