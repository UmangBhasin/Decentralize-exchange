"use client";

import { useState } from "react";
import Link from "next/link";
import MarketHeader from "@/components/MarketHeader";

export default function LoginPage() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    setError(null);

    if (!window.ethereum) {
      setError("MetaMask is not installed.");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setWallet(accounts[0]);
    } catch (err) {
      setError("Wallet connection failed.");
    }
  };

  return (
    <div className="min-h-screen">
      <MarketHeader />
      <main className="mx-auto max-w-xl px-6 py-12">
        <div className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-8 shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
            Wallet Access
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-[color:var(--color-foreground)]">
            Connect Wallet
          </h1>

          <p className="mt-2 text-sm text-[color:var(--color-muted)]">
            Connect your MetaMask wallet to access the DEX.
          </p>

          {wallet ? (
            <div className="mt-6 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              Wallet Connected:
              <br />
              <span className="font-mono">{wallet}</span>
              <br />
              <Link
                href="/"
                className="mt-3 inline-block text-[color:var(--color-accent)] underline"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {error && <p className="text-sm text-rose-300">{error}</p>}

              <button
                onClick={connectWallet}
                className="w-full rounded-2xl bg-[color:var(--color-accent)] py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-foreground)]"
              >
                Connect MetaMask
              </button>
            </div>
          )}

          {!wallet && (
            <p className="mt-6 text-sm text-[color:var(--color-muted)]">
              Don’t have MetaMask?{" "}
              <a
                href="https://metamask.io/download/"
                target="_blank"
                className="text-[color:var(--color-accent)]"
              >
                Install here
              </a>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
