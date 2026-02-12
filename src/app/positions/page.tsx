"use client";

import { useMemo, useState } from "react";
import MarketHeader from "@/components/MarketHeader";
import { getPositionSummaries, PositionSummary } from "@/lib/portfolio";

const filterPositions = (positions: PositionSummary[], query: string, pnlFilter: string) => {
  const normalizedQuery = query.trim().toLowerCase();

  return positions.filter((position) => {
    const matchesQuery = !normalizedQuery || position.symbol.toLowerCase().includes(normalizedQuery);
    const pnlIsPositive = position.unrealizedPnl >= 0;
    const matchesPnl = pnlFilter === "all"
      ? true
      : pnlFilter === "positive"
        ? pnlIsPositive
        : !pnlIsPositive;

    return matchesQuery && matchesPnl;
  });
};

const exportPositionsCsv = (rows: PositionSummary[]) => {
  const header = ["Symbol", "Quantity", "AvgEntry", "CostBasis", "LastPrice", "UnrealizedPnL", "UnrealizedPnLPercent", "RealizedPnL"];
  const lines = rows.map((row) => [
    row.symbol,
    row.quantity.toFixed(6),
    row.avgEntry.toFixed(2),
    row.costBasis.toFixed(2),
    row.lastPrice.toFixed(2),
    row.unrealizedPnl.toFixed(2),
    row.unrealizedPnlPercent.toFixed(2),
    row.realizedPnl.toFixed(2),
  ]);

  const csv = [header, ...lines]
    .map((line) => line.join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "positions.csv";
  link.click();
  window.URL.revokeObjectURL(url);
};

export default function PositionsPage() {
  const [query, setQuery] = useState("");
  const [pnlFilter, setPnlFilter] = useState("all");
  const positions = getPositionSummaries();

  const filtered = useMemo(() => filterPositions(positions, query, pnlFilter), [positions, query, pnlFilter]);

  return (
    <div className="min-h-screen">
      <MarketHeader active="positions" />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/90 p-6 shadow-lg backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
            Portfolio
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[color:var(--color-foreground)]">
            Positions
          </h1>
          <p className="mt-1 text-sm text-[color:var(--color-muted)]">
            Track open positions, unrealized PnL, and export snapshots.
          </p>
        </div>

        <div className="mt-6 rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search symbol..."
              className="min-w-[220px] flex-1 rounded-full border border-[color:var(--color-border)] bg-transparent px-4 py-2 text-sm font-semibold text-[color:var(--color-foreground)] focus:border-accent focus:outline-none"
            />
            <div className="flex items-center gap-2">
              {["all", "positive", "negative"].map((option) => (
                <button
                  key={option}
                  onClick={() => setPnlFilter(option)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                    pnlFilter === option
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-[color:var(--color-border)] text-[color:var(--color-muted)] hover:border-accent/60"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <button
              onClick={() => exportPositionsCsv(filtered)}
              className="rounded-full border border-[color:var(--color-border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)] hover:border-accent"
            >
              Export CSV
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-[color:var(--color-border)] px-4 py-8 text-center text-sm text-[color:var(--color-muted)]">
                No positions found
              </div>
            ) : (
              filtered.map((position) => {
                const pnlPositive = position.unrealizedPnl >= 0;
                return (
                  <div
                    key={position.symbol}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[color:var(--color-border)] px-4 py-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
                        {position.symbol}/USDT
                      </p>
                      <p className="text-xs text-[color:var(--color-muted)]">
                        Qty {position.quantity.toFixed(6)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
                        Avg ${position.avgEntry.toFixed(2)}
                      </p>
                      <p className="text-xs text-[color:var(--color-muted)]">
                        Last ${position.lastPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[color:var(--color-muted)]">
                        Cost ${position.costBasis.toFixed(2)}
                      </p>
                      <p className={`text-sm font-semibold ${pnlPositive ? "text-emerald-400" : "text-rose-400"}`}>
                        {pnlPositive ? "+" : ""}${position.unrealizedPnl.toFixed(2)}
                      </p>
                      <p className={`text-xs ${pnlPositive ? "text-emerald-400" : "text-rose-400"}`}>
                        {pnlPositive ? "+" : ""}{position.unrealizedPnlPercent.toFixed(2)}%
                      </p>
                      <p className="text-xs text-[color:var(--color-muted)]">
                        Realized ${position.realizedPnl.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
