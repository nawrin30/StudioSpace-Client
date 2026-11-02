"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";

import GoogleLoginButton from "@/components/GoogleLoginButton";

interface RegistrationForm {
  name: string;
  email: string;
  photoURL: string;
  password: string;
}

const initialForm: RegistrationForm = {
  name: "",
  email: "",
  photoURL: "",
  password: "",
};

export default function RegisterPage() {
  const [form, setForm] = useState<RegistrationForm>(initialForm);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  function updateField(field: keyof RegistrationForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const passwordIsValid =
      form.password.length >= 6 &&
      /[A-Z]/.test(form.password) &&
      /[a-z]/.test(form.password);

    if (!passwordIsValid) {
      toast.error("Use uppercase, lowercase and at least 6 characters in your password.");
      return;
    }

    setBusy(true);
    try {
      await api.post("/auth/register", form);
      toast.success("Account created. Please log in.");
      router.push("/login");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Could not create your account."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page shell">
      <div className="form-card">
        <span className="eyebrow">Join the creative community</span>
        <h1 className="page-title">Make an account.</h1>
        <p className="muted">One account. A whole lot of room to create.</p>

        <form onSubmit={handleSubmit}>
          <label className="field">
            Your name
            <input required value={form.name} onChange={(event) => updateField("name", event.target.value)} />
          </label>
          <label className="field">
            Email address
            <input type="email" required value={form.email} onChange={(event) => updateField("email", event.target.value)} />
          </label>
          <label className="field">
            Photo URL
            <input type="url" value={form.photoURL} onChange={(event) => updateField("photoURL", event.target.value)} placeholder="https://…" />
          </label>
          <label className="field">
            Password
            <input type="password" required value={form.password} onChange={(event) => updateField("password", event.target.value)} />
          </label>
          <button className="btn btn-dark" disabled={busy} style={{ width: "100%" }}>
            {busy ? "Creating account…" : "Create account"}
          </button>
        </form>


        <div style={{ textAlign: "center", margin: "20px 0" }}>
  <p className="muted">OR CONTINUE WITH</p>
  <GoogleLoginButton />
</div>

        <p className="muted">
          Already have an account? <Link href="/login"><b>Log in</b></Link>
        </p>
      </div>
    </main>
  );
}
