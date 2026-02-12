"use client";

import type { MarketCoin } from "@/lib/market";
import { formatCompact, formatCurrency, formatPercent } from "@/lib/format";

type CoinTableProps = {
  coins: MarketCoin[];
  watchlist: string[];
  onToggleWatch: (coinId: string) => void;
};

export default function CoinTable({
  coins,
  watchlist,
  onToggleWatch,
}: CoinTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-sm">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_120px] gap-4 border-b border-[color:var(--color-border)] px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
        <span>Asset</span>
        <span>Price</span>
        <span>Volume</span>
        <span>24h</span>
        <span>Watch</span>
      </div>
      <div className="divide-y divide-[color:var(--color-border)]">
        {coins.map((coin) => {
          const change = coin.price_change_percentage_24h ?? 0;
          const isUp = change >= 0;
          const isWatched = watchlist.includes(coin.id);

          return (
            <div
              key={coin.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_120px] items-center gap-4 px-6 py-4 text-sm"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)]">
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
                    {coin.name}
                  </p>
                  <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
                    {coin.symbol}
                  </p>
                </div>
              </div>
              <span className="font-semibold text-[color:var(--color-foreground)]">
                {formatCurrency(coin.current_price)}
              </span>
              <span className="text-[color:var(--color-muted)]">
                {formatCompact(coin.total_volume)}
              </span>
              <span className={isUp ? "text-emerald-600" : "text-rose-500"}>
                {isUp ? "+" : ""}
                {formatPercent(change)}
              </span>
              <button
                onClick={() => onToggleWatch(coin.id)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                  isWatched
                    ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent)] text-[color:var(--color-accent-foreground)]"
                    : "border-[color:var(--color-border)] text-[color:var(--color-muted)] hover:border-[color:var(--color-accent)]"
                }`}
              >
                {isWatched ? "Watching" : "Watch"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
