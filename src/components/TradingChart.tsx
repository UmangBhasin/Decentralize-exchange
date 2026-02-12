"use client";

import { useEffect, useRef, useState } from "react";
import TimeframeButtons from "@/components/TimeframeButtons";

type TradingChartProps = {
  symbol?: string;
  interval: string;
  indicators: string[];
  onIntervalChange: (value: string) => void;
  onToggleIndicator: (indicator: string) => void;
};

const INDICATOR_LABELS: Record<string, string> = {
  rsi: "RSI",
  macd: "MACD",
  ema: "EMA",
  sma: "SMA",
  bb: "Bollinger",
  stoch: "Stoch",
  vwap: "VWAP",
};

const INDICATOR_STUDIES: Record<string, string> = {
  rsi: "RSI@tv-basicstudies",
  macd: "MACD@tv-basicstudies",
  ema: "EMA@tv-basicstudies",
  sma: "MA@tv-basicstudies",
  bb: "BB@tv-basicstudies",
  stoch: "Stochastic@tv-basicstudies",
  vwap: "VWAP@tv-basicstudies",
};

export default function TradingChart({
  symbol = "BTCUSDT",
  interval,
  indicators,
  onIntervalChange,
  onToggleIndicator,
}: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
        );
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as { price: string };
        setPrice(Number(data.price));
      } catch {
        setPrice(null);
      }
    };

    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [symbol]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    containerRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: `BINANCE:${symbol}`,
      interval,
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      enable_publishing: false,
      hide_top_toolbar: true,
      allow_symbol_change: false,
      save_image: false,
      withdateranges: false,
      studies: indicators
        .map((indicator) => INDICATOR_STUDIES[indicator])
        .filter(Boolean),
    });
    containerRef.current.appendChild(script);
  }, [interval, symbol, indicators]);

  return (
    <div className="bg-background">
      <div className="border-b border-color-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TimeframeButtons value={interval} onChange={onIntervalChange} />
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em]">
            {Object.entries(INDICATOR_LABELS).map(([key, label]) => {
              const isActive = indicators.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => onToggleIndicator(key)}
                  className={`rounded-full border px-3 py-1 transition ${
                    isActive
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-color-border text-color-muted hover:border-accent/60"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="h-[600px] overflow-hidden">
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </div>
  );
}
