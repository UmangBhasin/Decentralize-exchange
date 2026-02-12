"use client";

import { useState } from "react";
import Link from "next/link";
import MarketHeader from "@/components/MarketHeader";
import { firebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!firebaseAuth || !isFirebaseConfigured) {
      setError("Firebase is not configured. Add env vars to enable signup.");
      return;
    }

    try {
      setStatus("loading");
      await createUserWithEmailAndPassword(firebaseAuth, email, password);
      setStatus("success");
    } catch (err) {
      setStatus("idle");
      const message =
        err instanceof Error
          ? err.message
          : "Signup failed. Try a different email or password.";
      setError(message);
    }
  };

  return (
    <div className="min-h-screen">
      <MarketHeader />
      <main className="mx-auto max-w-xl px-6 py-12">
        <div className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-8 shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
            Account
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[color:var(--color-foreground)]">
            Create account
          </h1>
          <p className="mt-2 text-sm text-[color:var(--color-muted)]">
            Sign up to save watchlists and sync your wallet.
          </p>

          {!isFirebaseConfigured ? (
            <div className="mt-4 rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              Add Firebase env vars to enable signup.
            </div>
          ) : null}

          {error && (
            <div className="mt-4 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          {status === "success" ? (
            <div className="mt-6 rounded-2xl border border-green-400/40 bg-green-500/10 px-4 py-3 text-sm text-green-200">
              Account created! <Link href="/auth/login" className="text-[color:var(--color-accent)] underline">Log In</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="rounded-2xl border border-[color:var(--color-border)] px-4 py-3">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full bg-transparent text-sm font-semibold text-[color:var(--color-foreground)] outline-none"
                  placeholder="you@exchange.com"
                  required
                  disabled={status === "loading"}
                />
              </div>
              <div className="rounded-2xl border border-[color:var(--color-border)] px-4 py-3">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full bg-transparent text-sm font-semibold text-[color:var(--color-foreground)] outline-none"
                  placeholder="At least 8 characters"
                  required
                  disabled={status === "loading"}
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-2xl bg-[color:var(--color-accent)] py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-foreground)] disabled:opacity-50"
              >
                {status === "loading" ? "Creating..." : "Create account"}
              </button>
            </form>
          )}

          {status !== "success" && (
            <p className="mt-6 text-sm text-[color:var(--color-muted)]">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-[color:var(--color-accent)]">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
