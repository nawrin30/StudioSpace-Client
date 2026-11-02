"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { useAuth } from "@/components/AuthProvider";
import type { User } from "@/types";
import GoogleLoginButton from "@/components/GoogleLoginButton"


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);

    try {
      const response = await api.post<User>("/auth/login", { email, password });
      setUser(response.data);
      toast.success("Welcome back to StudioSpace.");
      router.push("/dashboard");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Login failed. Check your details."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page shell">
      <div className="form-card">
        <span className="eyebrow">Good to see you again</span>
        <h1 className="page-title">Log in.</h1>
        <p className="muted">Pick up where your next big idea left off.</p>

        <form onSubmit={handleSubmit}>
          <label className="field">
            Email address
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label className="field">
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
            />
          </label>
          <button className="btn btn-dark" disabled={busy} style={{ width: "100%" }}>
            {busy ? "Signing in…" : "Log in"}
          </button>
        </form>

        <div style={{ textAlign: "center", margin: "20px 0" }}>
  <p className="muted">OR CONTINUE WITH</p>
  <GoogleLoginButton />
</div>

        <p className="muted">
          New to StudioSpace? <Link href="/register"><b>Create an account</b></Link>
        </p>
      </div>
    </main>
  );
}
