"use client";

import { useMemo, useState } from "react";
import type { MarketCoin } from "@/lib/market";
import MarketHeader from "@/components/MarketHeader";
import SearchBar from "@/components/SearchBar";
import CoinTable from "@/components/CoinTable";
import { formatCompact, formatCurrency, formatPercent } from "@/lib/format";

type MarketDashboardProps = {
  coins: MarketCoin[];
};

type FilterKey = "all" | "gainers" | "losers";

const filterLabels: Record<FilterKey, string> = {
  all: "All markets",
  gainers: "Top gainers",
  losers: "Top losers",
};

export default function MarketDashboard({ coins }: MarketDashboardProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [watchlist, setWatchlist] = useState<string[]>(["bitcoin", "ethereum"]);

  const filteredCoins = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    let visible = coins;

    if (normalizedQuery) {
      visible = visible.filter(
        (coin) =>
          coin.name.toLowerCase().includes(normalizedQuery) ||
          coin.symbol.toLowerCase().includes(normalizedQuery)
      );
    }

    if (filter === "gainers") {
      visible = [...visible].sort(
        (a, b) =>
          (b.price_change_percentage_24h ?? 0) -
          (a.price_change_percentage_24h ?? 0)
      );
    }

    if (filter === "losers") {
      visible = [...visible].sort(
        (a, b) =>
          (a.price_change_percentage_24h ?? 0) -
          (b.price_change_percentage_24h ?? 0)
      );
    }

    return visible;
  }, [coins, filter, query]);

  const stats = useMemo(() => {
    const top = coins.slice(0, 5);
    return top.map((coin) => ({
      id: coin.id,
      name: coin.name,
      change: coin.price_change_percentage_24h ?? 0,
      price: coin.current_price,
    }));
  }, [coins]);

  const handleWatchToggle = (coinId: string) => {
    setWatchlist((prev) =>
      prev.includes(coinId)
        ? prev.filter((item) => item !== coinId)
        : [...prev, coinId]
    );
  };

  return (
    <div className="min-h-screen">
      <MarketHeader active="market" />
      <div className="grid-overlay">
        <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
          <section className="grid gap-6 rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/90 p-6 shadow-lg backdrop-blur">
            <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[color:var(--color-muted)]">
                  Live market
                </p>
                <h1 className="text-3xl font-semibold text-[color:var(--color-foreground)]">
                  Global crypto market dashboard
                </h1>
                <p className="text-sm text-[color:var(--color-muted)]">
                  Real-time prices, volume, and movement across top assets.
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row">
                <SearchBar value={query} onChange={setQuery} />
                <div className="flex items-center gap-2">
                  {(Object.keys(filterLabels) as FilterKey[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                        filter === key
                          ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent)] text-[color:var(--color-accent-foreground)]"
                          : "border-[color:var(--color-border)] text-[color:var(--color-muted)] hover:border-[color:var(--color-accent)]"
                      }`}
                    >
                      {filterLabels[key]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
              <div className="rounded-2xl border border-[color:var(--color-border)] bg-[linear-gradient(135deg,rgba(240,185,11,0.14),transparent)] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
                  Market pulse
                </p>
                <div className="mt-4 grid gap-3">
                  {stats.map((coin) => (
                    <div
                      key={coin.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="font-semibold text-[color:var(--color-foreground)]">
                        {coin.name}
                      </span>
                      <span className="text-[color:var(--color-muted)]">
                        {formatCurrency(coin.price)}
                      </span>
                      <span
                        className={
                          coin.change >= 0 ? "text-emerald-400" : "text-rose-400"
                        }
                      >
                        {coin.change >= 0 ? "+" : ""}
                        {formatPercent(coin.change)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] text-[color:var(--color-foreground)]">
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
                    Market cap
                  </p>
                  <p className="mt-3 text-3xl font-semibold">${formatCompact(
                    coins.reduce((total, coin) => total + coin.market_cap, 0)
                  )}</p>
                  <p className="mt-2 text-sm text-[color:var(--color-muted)]">
                    Total market cap across tracked assets.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <CoinTable
              coins={filteredCoins}
              watchlist={watchlist}
              onToggleWatch={handleWatchToggle}
            />
            <div className="flex flex-col gap-4 rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
                  Watchlist
                </p>
                <p className="mt-1 text-lg font-semibold text-[color:var(--color-foreground)]">
                  Saved assets
                </p>
              </div>
              <div className="flex flex-col gap-3">
                {coins
                  .filter((coin) => watchlist.includes(coin.id))
                  .slice(0, 6)
                  .map((coin) => {
                    const change = coin.price_change_percentage_24h ?? 0;

                    return (
                      <div
                        key={coin.id}
                        className="flex items-center justify-between rounded-2xl border border-[color:var(--color-border)] px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
                            {coin.name}
                          </p>
                          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
                            {coin.symbol}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
                            {formatCurrency(coin.current_price)}
                          </p>
                          <p
                            className={
                              change >= 0
                                ? "text-xs text-emerald-400"
                                : "text-xs text-rose-400"
                            }
                          >
                            {change >= 0 ? "+" : ""}
                            {formatPercent(change)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
                Market intel
              </p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--color-foreground)]">
                Derivatives snapshot
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {[
                  { label: "Open interest", value: "$9.4B" },
                  { label: "Funding rate", value: "+0.018%" },
                  { label: "Long/short", value: "1.42" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-[color:var(--color-border)] px-4 py-3"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
                      {item.label}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[color:var(--color-foreground)]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
                Newsflow
              </p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--color-foreground)]">
                Market headlines
              </p>
              <div className="mt-4 space-y-3">
                {[
                  "BTC ETF inflows accelerate ahead of CPI.",
                  "ETH staking yields hold above 3.2%.",
                  "SOL ecosystem TVL climbs to new quarterly high.",
                ].map((headline) => (
                  <div
                    key={headline}
                    className="rounded-2xl border border-[color:var(--color-border)] px-4 py-3 text-sm text-[color:var(--color-muted)]"
                  >
                    {headline}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
