"use client";

import Link from "next/link";
import UserProfile from "./UserProfile";

type MarketHeaderProps = {
  active?: "market" | "trade" | "wallet" | "positions";
};

const links = [
  { href: "/", label: "Market", key: "market" },
  { href: "/trade", label: "Trade", key: "trade" },
  { href: "/positions", label: "Positions", key: "positions" },
  { href: "/wallet", label: "Wallet", key: "wallet" },
] as const;

export default function MarketHeader({ active = "market" }: MarketHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--color-accent)] text-[color:var(--color-accent-foreground)]">
            EX
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
              Exchange
            </p>
            <p className="text-base font-semibold text-[color:var(--color-foreground)]">
              Market Desk
            </p>
          </div>
        </div>
        <nav className="hidden items-center gap-2 rounded-full border border-[color:var(--color-border)] p-1 text-sm font-medium md:flex">
          {links.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={`rounded-full px-4 py-2 transition ${
                active === link.key
                  ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-foreground)]"
                  : "text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <UserProfile />
      </div>
    </header>
  );
}
