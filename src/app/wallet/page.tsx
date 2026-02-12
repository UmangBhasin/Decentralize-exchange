import MarketHeader from "@/components/MarketHeader";
import WalletDashboard from "@/components/WalletDashboard";

export default function WalletPage() {
  return (
    <div className="min-h-screen">
      <MarketHeader active="wallet" />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/90 p-6 shadow-lg backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
            Wallet system
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[color:var(--color-foreground)]">
            Portfolio overview
          </h1>
          <p className="mt-1 text-sm text-[color:var(--color-muted)]">
            Track balances, deposits, withdrawals, and history.
          </p>
        </div>

        <div className="mt-6">
          <WalletDashboard />
        </div>
      </main>
    </div>
  );
}
