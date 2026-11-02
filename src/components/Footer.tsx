
"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer" id="about">
      <div>
        <Link href="/" className="brand light">
          <span className="brandmark">◉</span> studio<span>space</span>
        </Link>
        <p>A better space to make your next big thing.</p>
        <small>© 2026 StudioSpace. Built for the makers.</small>
      </div>

      <div>
        <b>Explore</b>
        <Link href="/studios">All studios</Link>
        <Link href="/studios?category=Photo%20Studio">Photo studios</Link>
        <Link href="/studios?category=Podcast%20Lounge">Podcast rooms</Link>
      </div>

      <div>
        <b>For hosts</b>
        <Link href="/add-studio">List your space</Link>
        <Link href="/dashboard">Host dashboard</Link>
        <a href="mailto:hello@studiospace.example">Contact</a>
      </div>

      <div>
        <b>Stay in the loop</b>
        <p>Ideas, spaces and stories for creative people.</p>
        <form className="newsletter" onSubmit={(event) => event.preventDefault()}>
          <input type="email" required placeholder="Your email address" aria-label="Email address" />
          <button type="submit" aria-label="Subscribe">→</button>
        </form>
        <small>Instagram · YouTube · 𝕏</small>
      </div>
    </footer>
  );
}
