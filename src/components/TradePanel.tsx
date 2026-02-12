"use client";

import { useEffect, useMemo, useState } from "react";
import { getPortfolio, placeSpotOrder } from "@/lib/portfolio";

type TradePanelProps = {
  tradeType?: "spot" | "futures" | "margin";
  symbol?: string;
  lastPrice?: number;
};

export default function TradePanel({ tradeType = "spot", symbol = "BTCUSDT", lastPrice = 0 }: TradePanelProps) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [leverage, setLeverage] = useState(10);
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [balances, setBalances] = useState<Record<string, number>>({});

  const baseAsset = symbol.replace("USDT", "");

  useEffect(() => {
    const loadBalances = () => {
      const portfolio = getPortfolio();
      setBalances(portfolio.balances);
    };

    loadBalances();
    window.addEventListener("portfolio:update", loadBalances);
    return () => window.removeEventListener("portfolio:update", loadBalances);
  }, []);

  const resolvePrice = () => {
    const resolved = orderType === "market" ? lastPrice : parseFloat(price);
    return Number.isFinite(resolved) && resolved > 0 ? resolved : 0;
  };

  const calculateLiquidationPrice = () => {
    const entryPrice = resolvePrice();
    if (!amount || !entryPrice) return "--";
    const liquidationPercent = side === "buy" ? (1 - 1 / leverage) : (1 + 1 / leverage);
    return (entryPrice * liquidationPercent).toFixed(2);
  };

  const calculateMargin = () => {
    const total = calculateTotalValue();
    if (!total) return "0.00";
    return (total / leverage).toFixed(2);
  };

  const calculateTotalValue = () => {
    const amountValue = parseFloat(amount);
    const entryPrice = resolvePrice();
    if (!amountValue || !entryPrice) return 0;
    return side === "buy" ? amountValue : amountValue * entryPrice;
  };

  const calculateTotal = () => {
    const total = calculateTotalValue();
    return total ? total.toFixed(2) : "0.00";
  };

  const availableBalance = useMemo(() => {
    return side === "buy" ? balances.USDT || 0 : balances[baseAsset] || 0;
  }, [balances, baseAsset, side]);

  const formatAvailableBalance = () => {
    return side === "buy" ? availableBalance.toFixed(2) : availableBalance.toFixed(6);
  };

  const handlePercentClick = (percent: number) => {
    const value = (availableBalance * percent) / 100;
    const precision = side === "buy" ? 2 : 6;
    setAmount(value ? value.toFixed(precision) : "");
  };

  const handlePlaceOrder = () => {
    setFeedback(null);
    const amountValue = parseFloat(amount);
    const entryPrice = resolvePrice();

    if (!amountValue || amountValue <= 0) {
      setFeedback("Enter a valid amount.");
      return;
    }

    if (!entryPrice) {
      setFeedback("Price unavailable.");
      return;
    }

    const result = placeSpotOrder({
      symbol,
      side,
      price: entryPrice,
      amount: amountValue,
    });

    if (result.error) {
      setFeedback(result.error);
      return;
    }

    setFeedback("Order placed and portfolio updated.");
    setAmount("");
    if (orderType === "limit") {
      setPrice("");
    }
  };

  return (
    <div className="border-t border-color-border bg-color-surface">
      <div className="border-b border-color-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-color-muted">
            {tradeType === "futures" ? "Futures Order" : tradeType === "margin" ? "Margin Order" : "Spot Order"}
          </h3>
          <div className="flex items-center gap-2 rounded-full border border-color-border bg-background p-1 text-xs font-semibold">
            <button
              onClick={() => setSide("buy")}
              className={`rounded-full px-4 py-1.5 transition ${
                side === "buy"
                  ? "bg-emerald-500 text-white"
                  : "text-color-muted hover:text-foreground"
              }`}
            >
              BUY
            </button>
            <button
              onClick={() => setSide("sell")}
              className={`rounded-full px-4 py-1.5 transition ${
                side === "sell"
                  ? "bg-rose-500 text-white"
                  : "text-color-muted hover:text-foreground"
              }`}
            >
              SELL
            </button>
          </div>
        </div>

        {/* Order Type */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setOrderType("limit")}
            className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition ${
              orderType === "limit"
                ? "border-accent bg-accent/10 text-accent"
                : "border-color-border text-color-muted hover:border-accent/50"
            }`}
          >
            Limit
          </button>
          <button
            onClick={() => setOrderType("market")}
            className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition ${
              orderType === "market"
                ? "border-accent bg-accent/10 text-accent"
                : "border-color-border text-color-muted hover:border-accent/50"
            }`}
          >
            Market
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Leverage Slider (Futures only) */}
        {tradeType === "futures" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-color-muted">
                Leverage
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLeverage(Math.max(1, leverage - 1))}
                  className="flex h-6 w-6 items-center justify-center rounded border border-color-border text-xs hover:border-accent"
                >
                  -
                </button>
                <span className="min-w-15 text-center font-bold text-accent">
                  {leverage}x
                </span>
                <button
                  onClick={() => setLeverage(Math.min(125, leverage + 1))}
                  className="flex h-6 w-6 items-center justify-center rounded border border-color-border text-xs hover:border-accent"
                >
                  +
                </button>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="125"
              value={leverage}
              onChange={(e) => setLeverage(parseInt(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="mt-1 flex justify-between text-xs text-color-muted">
              <span>1x</span>
              <span>25x</span>
              <span>50x</span>
              <span>100x</span>
              <span>125x</span>
            </div>
          </div>
        )}

        {/* Price Input */}
        {orderType === "limit" && (
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-color-muted">
              Price (USDT)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-color-border bg-background px-4 py-2.5 text-sm font-semibold focus:border-accent focus:outline-none"
            />
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-color-muted">
            Amount ({side === "buy" ? "USDT" : baseAsset})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-lg border border-color-border bg-background px-4 py-2.5 text-sm font-semibold focus:border-accent focus:outline-none"
          />
          <div className="mt-2 flex gap-2">
            {[25, 50, 75, 100].map((percent) => (
              <button
                key={percent}
                onClick={() => handlePercentClick(percent)}
                className="flex-1 rounded border border-color-border py-1 text-xs font-semibold hover:border-accent transition-colors"
              >
                {percent}%
              </button>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="rounded-lg border border-color-border bg-background p-3 space-y-2 text-sm">
          {tradeType === "futures" && (
            <>
              <div className="flex justify-between">
                <span className="text-color-muted">Margin Required</span>
                <span className="font-semibold">${calculateMargin()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-color-muted">Est. Liq. Price</span>
                <span className="font-semibold text-rose-400">${calculateLiquidationPrice()}</span>
              </div>
            </>
          )}
          <div className="flex justify-between pt-2 border-t border-color-border">
            <span className="text-color-muted">Total (USDT)</span>
            <span className="font-bold">${calculateTotal()}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handlePlaceOrder}
          className={`w-full rounded-lg py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:opacity-90 ${
            side === "buy" ? "bg-emerald-500" : "bg-rose-500"
          }`}
        >
          {side === "buy" ? "Buy/Long" : "Sell/Short"}
        </button>

        {feedback && (
          <div className="rounded-lg border border-color-border bg-background px-3 py-2 text-xs text-color-muted">
            {feedback}
          </div>
        )}

        {/* Available Balance */}
        <div className="text-center text-xs text-color-muted">
          Available: <span className="font-semibold">{formatAvailableBalance()} {side === "buy" ? "USDT" : baseAsset}</span>
        </div>
      </div>

      {/* Open Positions (Futures) */}
      {tradeType === "futures" && (
        <div className="border-t border-color-border p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-color-muted">
            Open Positions
          </h4>
          <div className="text-center py-8 text-sm text-color-muted">
            No open positions
          </div>
        </div>
      )}
    </div>
  );
}
