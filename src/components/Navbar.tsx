"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTheme } from "@/context/ThemeProvider";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { dark, toggle } = useTheme();
  const { user, setUser, loading } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
      setUser(null);
      setMenuOpen(false);
      toast.success("You are signed out.");
      router.push("/");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Could not sign out."));
    }
  }

  return (
    <header className="nav">
      <Link href="/" className="brand" aria-label="StudioSpace home">
        <span className="brandmark">◉</span> studio<span>space</span>
      </Link>

      <nav aria-label="Main navigation">
        <Link href="/">Home</Link>
        <Link href="/studios">Explore Studios</Link>
        <a href="/#how">How it works</a>
        <a href="/#about">About us</a>
      </nav>

      <div className="nav-actions">
        <button
          className="icon-btn"
          onClick={toggle}
          aria-label="Toggle colour theme"
          type="button"
        >
          {dark ? "☀" : "☾"}
        </button>

        {!loading && user ? (
          <div className="profile">
            <button
              className="avatar"
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              aria-expanded={menuOpen}
              aria-label="Open account menu"
            >
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt="" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </button>
            {menuOpen && (
              <div className="dropdown">
                <strong>{user.name}</strong>
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/add-studio">Add New Studio</Link>
                <Link href="/my-listings">My Studio Listings</Link>
                <Link href="/my-bookings">My Bookings</Link>
                <Link href="/host-bookings">Host Booking Requests</Link>
                <Link href="/wishlist">Saved Studios</Link>
                <button type="button" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        ) : !loading ? (
          <>
            <Link className="login-link" href="/login">Log in</Link>
            <Link className="btn btn-dark small" href="/register">Get started ↗</Link>
          </>
        ) : null}
      </div>
    </header>
  );
}
