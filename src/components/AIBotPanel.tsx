"use client";

import { useEffect, useMemo, useState } from "react";
import { getPortfolio, placeSpotOrder } from "@/lib/portfolio";

type AIBotPanelProps = {
  symbol: string;
  interval: string;
  indicators: string[];
  lastPrice: number;
  changePercent: number;
};

type BotResponse = {
  signal: "buy" | "sell" | "wait";
  confidence: number;
  rationale: string;
  summary: string;
  indicatorsUsed: string[];
  modelId?: string;
};

export default function AIBotPanel({
  symbol,
  interval,
  indicators,
  lastPrice,
  changePercent,
}: AIBotPanelProps) {
  const [loading, setLoading] = useState(false);
  const [signal, setSignal] = useState<BotResponse["signal"]>("wait");
  const [confidence, setConfidence] = useState(0);
  const [summary, setSummary] = useState("Run analysis to get a trade idea.");
  const [rationale, setRationale] = useState("");
  const [orderSize, setOrderSize] = useState("100");
  const [autoTrade, setAutoTrade] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [balances, setBalances] = useState<Record<string, number>>({});

  const baseAsset = useMemo(() => symbol.replace("USDT", ""), [symbol]);

  useEffect(() => {
    const loadBalances = () => {
      const portfolio = getPortfolio();
      setBalances(portfolio.balances);
    };

    loadBalances();
    window.addEventListener("portfolio:update", loadBalances);
    return () => window.removeEventListener("portfolio:update", loadBalances);
  }, []);

  const availableUsdt = balances.USDT || 0;
  const availableBase = balances[baseAsset] || 0;

  const handleAnalyze = async () => {
    setLoading(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/ai/bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          interval,
          indicators,
          price: lastPrice,
          changePercent,
          modelId: "custom-model",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze");
      }

      const data = (await response.json()) as BotResponse;
      setSignal(data.signal);
      setConfidence(data.confidence);
      setSummary(data.summary);
      setRationale(data.rationale);
    } catch (error) {
      console.error(error);
      setSummary("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = () => {
    setFeedback(null);
    const sizeValue = Number(orderSize);
    if (!Number.isFinite(sizeValue) || sizeValue <= 0) {
      setFeedback("Enter a valid order size.");
      return;
    }
    if (!lastPrice) {
      setFeedback("Price unavailable.");
      return;
    }

    const amount = signal === "sell" ? sizeValue / lastPrice : sizeValue;
    const result = placeSpotOrder({
      symbol,
      side: signal === "sell" ? "sell" : "buy",
      price: lastPrice,
      amount,
    });

    if (result.error) {
      setFeedback(result.error);
      return;
    }

    setFeedback("Order placed from AI signal.");
  };

  const signalStyle = useMemo(() => {
    if (signal === "buy") return "text-emerald-400";
    if (signal === "sell") return "text-rose-400";
    return "text-color-muted";
  }, [signal]);

  return (
    <section className="border-t border-color-border bg-color-surface px-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-color-muted">
            AI Trade Bot
          </p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">
            Indicator-driven analysis
          </h3>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="rounded-full border border-color-border px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-color-muted hover:border-accent disabled:opacity-60"
        >
          {loading ? "Analyzing..." : "Run analysis"}
        </button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-color-border bg-background p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-color-muted">Signal</p>
              <p className={`text-xl font-semibold uppercase ${signalStyle}`}>{signal}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-color-muted">Confidence</p>
              <p className="text-lg font-semibold text-foreground">{Math.round(confidence * 100)}%</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-color-muted">{summary}</p>
          {rationale && (
            <p className="mt-2 text-xs text-color-muted">{rationale}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.2em]">
            {indicators.map((indicator) => (
              <span
                key={indicator}
                className="rounded-full border border-color-border px-2 py-1 text-color-muted"
              >
                {indicator}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-color-border bg-background p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-color-muted">
              Auto trade
            </p>
            <button
              onClick={() => setAutoTrade((prev) => !prev)}
              className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                autoTrade
                  ? "border-emerald-400 text-emerald-400"
                  : "border-color-border text-color-muted"
              }`}
            >
              {autoTrade ? "Enabled" : "Disabled"}
            </button>
          </div>
          <div className="mt-3">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-color-muted">
              Order size (USDT)
            </label>
            <input
              type="number"
              value={orderSize}
              onChange={(event) => setOrderSize(event.target.value)}
              className="mt-2 w-full rounded-lg border border-color-border bg-transparent px-3 py-2 text-sm font-semibold text-foreground focus:border-accent focus:outline-none"
            />
          </div>
          <div className="mt-3 text-xs text-color-muted">
            Available: {availableUsdt.toFixed(2)} USDT | {availableBase.toFixed(6)} {baseAsset}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleExecute}
              disabled={!autoTrade || signal === "wait"}
              className="rounded-full bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground disabled:opacity-50"
            >
              Execute
            </button>
            <span className="text-[10px] text-color-muted">
              Sell converts USDT size to {baseAsset} at last price.
            </span>
          </div>
          {feedback && (
            <p className="mt-2 text-xs text-color-muted">{feedback}</p>
          )}
        </div>
      </div>
    </section>
  );
}
