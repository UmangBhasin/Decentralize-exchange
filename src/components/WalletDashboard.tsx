"use client";

import { useEffect, useMemo, useState } from "react";
import BalanceCard from "@/components/BalanceCard";
import TransactionTable from "@/components/TransactionTable";
import Link from "next/link";
import { closePositionPercent, getPortfolio, getPositionSummaries, hydratePortfolio, PortfolioTrade, PositionSummary } from "@/lib/portfolio";

type TokenRow = {
  name: string;
  symbol: string;
  balance: string;
  value: string;
};

const TOKEN_NAMES: Record<string, string> = {
  USDT: "Tether",
  BTC: "Bitcoin",
  ETH: "Ethereum",
  SOL: "Solana",
};

export default function WalletDashboard() {
  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [trades, setTrades] = useState<PortfolioTrade[]>([]);
  const [positions, setPositions] = useState<PositionSummary[]>([]);
  const [actionFeedback, setActionFeedback] = useState<Record<string, string>>({});

  const loadPortfolio = () => {
    const portfolio = getPortfolio();
    const rows = Object.entries(portfolio.balances).map(([symbol, balance]) => {
      const price = symbol === "USDT" ? 1 : portfolio.lastPrices[symbol] || 0;
      const value = balance * price;

      return {
        name: TOKEN_NAMES[symbol] || symbol,
        symbol,
        balance: balance.toFixed(symbol === "USDT" ? 2 : 6),
        value: `$${value.toFixed(2)}`,
      };
    });

    setTokens(rows);
    setTrades(portfolio.trades || []);
    setPositions(getPositionSummaries());
  };

  useEffect(() => {
    loadPortfolio();
    void hydratePortfolio().then(loadPortfolio);
    window.addEventListener("portfolio:update", loadPortfolio);
    return () => window.removeEventListener("portfolio:update", loadPortfolio);
  }, []);

  const totalBalance = useMemo(() => {
    return tokens.reduce((sum, token) => {
      const numeric = Number(token.value.replace("$", "")) || 0;
      return sum + numeric;
    }, 0);
  }, [tokens]);

  const availableBalance = useMemo(() => {
    const usdt = tokens.find((token) => token.symbol === "USDT");
    return usdt ? Number(usdt.value.replace("$", "")) : 0;
  }, [tokens]);

  const realizedPnlTotal = useMemo(() => {
    return positions.reduce((sum, position) => sum + (position.realizedPnl || 0), 0);
  }, [positions]);

  const handleTakeProfit = (symbol: string, percent: number) => {
    const result = closePositionPercent({ symbol, percent });
    if (result.error) {
      setActionFeedback((prev) => ({
        ...prev,
        [symbol]: result.error,
      }));
      return;
    }

    setActionFeedback((prev) => ({
      ...prev,
      [symbol]: `Booked ${percent}% profit.`,
    }));
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 lg:grid-cols-4">
        <BalanceCard label="Total balance" value={`$${totalBalance.toFixed(2)}`} change="+12.4%" />
        <BalanceCard label="Available" value={`$${availableBalance.toFixed(2)}`} />
        <BalanceCard
          label="Realized PnL"
          value={`${realizedPnlTotal >= 0 ? "+" : ""}$${realizedPnlTotal.toFixed(2)}`}
        />
        <BalanceCard label="In orders" value="$0.00" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
                Wallet
              </p>
              <p className="text-lg font-semibold text-[color:var(--color-foreground)]">
                Token balances
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/deposit"
                className="rounded-full border border-[color:var(--color-border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)] hover:border-accent transition-colors"
              >
                Deposit
              </Link>
              <button className="rounded-full border border-[color:var(--color-border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
                Withdraw
              </button>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {tokens.map((token) => (
              <div
                key={token.symbol}
                className="flex items-center justify-between rounded-2xl border border-[color:var(--color-border)] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
                    {token.name}
                  </p>
                  <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
                    {token.symbol}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
                    {token.balance}
                  </p>
                  <p className="text-xs text-[color:var(--color-muted)]">
                    {token.value}
                  </p>
                  {token.symbol !== "USDT" && (
                    <div className="mt-2 text-xs">
                      {(() => {
                        const position = positions.find((item) => item.symbol === token.symbol);
                        if (!position) return null;
                        const pnl = position.unrealizedPnl;
                        const pnlPercent = position.unrealizedPnlPercent;
                        const isPositive = pnl >= 0;
                        return (
                          <span className={isPositive ? "text-emerald-400" : "text-rose-400"}>
                            {isPositive ? "+" : ""}${pnl.toFixed(2)} ({isPositive ? "+" : ""}{pnlPercent.toFixed(2)}%)
                          </span>
                        );
                      })()}
                    </div>
                  )}
                  {token.symbol !== "USDT" && (
                    <div className="mt-2 flex flex-wrap justify-end gap-2">
                      {[25, 50, 75, 100].map((percent) => (
                        <button
                          key={percent}
                          onClick={() => handleTakeProfit(token.symbol, percent)}
                          className="rounded-full border border-[color:var(--color-border)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)] hover:border-accent"
                        >
                          {percent}%
                        </button>
                      ))}
                    </div>
                  )}
                  {actionFeedback[token.symbol] && (
                    <p className="mt-2 text-[10px] font-semibold text-[color:var(--color-muted)]">
                      {actionFeedback[token.symbol]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
                  Orders
                </p>
                <p className="text-lg font-semibold text-[color:var(--color-foreground)]">
                  Recent orders
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {trades.length === 0 ? (
                <div className="rounded-2xl border border-[color:var(--color-border)] px-4 py-6 text-center text-sm text-[color:var(--color-muted)]">
                  No orders yet
                </div>
              ) : (
                trades.slice(0, 6).map((trade) => {
                  const baseAsset = trade.symbol.replace("USDT", "");
                  const amountLabel = trade.side === "buy" ? `${trade.amount.toFixed(2)} USDT` : `${trade.amount.toFixed(6)} ${baseAsset}`;
                  return (
                    <div
                      key={trade.id}
                      className="flex items-center justify-between rounded-2xl border border-[color:var(--color-border)] px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
                          {baseAsset}/USDT
                          <span className={`ml-2 text-xs font-semibold ${trade.side === "buy" ? "text-emerald-400" : "text-rose-400"}`}>
                            {trade.side.toUpperCase()}
                          </span>
                        </p>
                        <p className="text-xs text-[color:var(--color-muted)]">
                          {new Date(trade.timestamp).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
                          ${trade.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-[color:var(--color-muted)]">
                          {amountLabel}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <TransactionTable />
        </div>
      </div>
    </div>
  );
}
