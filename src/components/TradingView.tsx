"use client";

import { useState, useEffect } from "react";
import TradingChart from "./TradingChart";
import OrderBook from "./OrderBook";
import TradePanel from "./TradePanel";
import AIBotPanel from "./AIBotPanel";
import { formatCurrency, formatPercent } from "@/lib/format";
import { closePositionPercent, getPortfolio, getPositionSummaries, PortfolioTrade, setLastPrice } from "@/lib/portfolio";

type TradeType = "spot" | "futures" | "margin";

type DepthResponse = {
  bids: [string, string][];
  asks: [string, string][];
};

type TradeResponse = {
  id: number;
  price: string;
  qty: string;
  time: number;
  isBuyerMaker: boolean;
};

type TickerResponse = {
  symbol: string;
  priceChangePercent: string;
  lastPrice: string;
  volume: string;
};

const POPULAR_PAIRS = [
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  "SOLUSDT",
  "XRPUSDT",
  "ADAUSDT",
  "DOGEUSDT",
  "MATICUSDT",
];

const INDICATOR_OPTIONS = ["rsi", "macd", "ema", "sma", "bb", "stoch", "vwap"];

export default function TradingView() {
  const [tradeType, setTradeType] = useState<TradeType>("spot");
  const [selectedPair, setSelectedPair] = useState("BTCUSDT");
  const [tickers, setTickers] = useState<TickerResponse[]>([]);
  const [orderBook, setOrderBook] = useState<{ asks: any[]; bids: any[] }>({
    asks: [],
    bids: [],
  });
  const [recentTrades, setRecentTrades] = useState<TradeResponse[]>([]);
  const [portfolioTrades, setPortfolioTrades] = useState<PortfolioTrade[]>([]);
  const [lastPrices, setLastPrices] = useState<Record<string, number>>({});
  const [closeFeedback, setCloseFeedback] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [unrealizedTotal, setUnrealizedTotal] = useState(0);
  const [realizedTotal, setRealizedTotal] = useState(0);
  const [interval, setInterval] = useState("60");
  const [indicators, setIndicators] = useState<string[]>(INDICATOR_OPTIONS);

  const currentTicker = tickers.find((t) => t.symbol === selectedPair);

  useEffect(() => {
    const fetchTickers = async () => {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(
            JSON.stringify(POPULAR_PAIRS)
          )}`
        );
        if (response.ok) {
          const data = (await response.json()) as TickerResponse[];
          setTickers(data);
        }
      } catch (error) {
        console.error("Failed to fetch tickers:", error);
      }
    };

    fetchTickers();
    const interval = setInterval(fetchTickers, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentTicker) {
      setLastPrice(currentTicker.symbol, Number(currentTicker.lastPrice));
    }
  }, [currentTicker]);

  useEffect(() => {
    const loadTrades = () => {
      const portfolio = getPortfolio();
      setPortfolioTrades(portfolio.trades || []);
      setLastPrices(portfolio.lastPrices || {});
      const summaries = getPositionSummaries();
      setUnrealizedTotal(summaries.reduce((sum, item) => sum + (item.unrealizedPnl || 0), 0));
      setRealizedTotal(summaries.reduce((sum, item) => sum + (item.realizedPnl || 0), 0));
    };

    loadTrades();
    window.addEventListener("portfolio:update", loadTrades);
    return () => window.removeEventListener("portfolio:update", loadTrades);
  }, []);

  useEffect(() => {
    const fetchOrderBook = async () => {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/depth?symbol=${selectedPair}&limit=12`
        );
        if (response.ok) {
          const data = (await response.json()) as DepthResponse;
          const buildBookRows = (rows: [string, string][]) => {
            let running = 0;
            return rows.map(([price, size]) => {
              const qty = Number(size);
              running += qty;
              return {
                price: Number(price),
                size: qty,
                total: running,
              };
            });
          };

          setOrderBook({
            asks: buildBookRows(data.asks.slice(0, 8)),
            bids: buildBookRows(data.bids.slice(0, 8)),
          });
        }
      } catch (error) {
        console.error("Failed to fetch order book:", error);
      }
    };

    const fetchTrades = async () => {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/trades?symbol=${selectedPair}&limit=20`
        );
        if (response.ok) {
          const data = (await response.json()) as TradeResponse[];
          setRecentTrades(data);
        }
      } catch (error) {
        console.error("Failed to fetch trades:", error);
      }
    };

    fetchOrderBook();
    fetchTrades();

    const bookInterval = setInterval(fetchOrderBook, 5000);
    const tradesInterval = setInterval(fetchTrades, 3000);

    return () => {
      clearInterval(bookInterval);
      clearInterval(tradesInterval);
    };
  }, [selectedPair]);

  const handleClosePercent = (symbol: string, percent: number) => {
    const result = closePositionPercent({ symbol, percent });
    if (result.error) {
      setCloseFeedback((prev) => ({ ...prev, [symbol]: result.error }));
      return;
    }
    setCloseFeedback((prev) => ({ ...prev, [symbol]: `Closed ${percent}%` }));
  };

  const filteredPairs = tickers.filter((ticker) =>
    ticker.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleIndicator = (indicator: string) => {
    setIndicators((prev) =>
      prev.includes(indicator)
        ? prev.filter((item) => item !== indicator)
        : [...prev, indicator]
    );
  };

  return (
    <main className="mx-auto max-w-480">
      {/* Trading Type Tabs */}
      <div className="border-b border-color-border bg-color-surface px-6 py-3">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setTradeType("spot")}
            className={`px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-colors ${
              tradeType === "spot"
                ? "text-accent border-b-2 border-accent"
                : "text-color-muted hover:text-foreground"
            }`}
          >
            Spot
          </button>
          <button
            onClick={() => setTradeType("futures")}
            className={`px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-colors ${
              tradeType === "futures"
                ? "text-accent border-b-2 border-accent"
                : "text-color-muted hover:text-foreground"
            }`}
          >
            Futures
          </button>
          <button
            onClick={() => setTradeType("margin")}
            className={`px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-colors ${
              tradeType === "margin"
                ? "text-accent border-b-2 border-accent"
                : "text-color-muted hover:text-foreground"
            }`}
          >
            Margin
          </button>
          {tradeType === "futures" && (
            <div className="ml-auto flex items-center gap-2 text-xs">
              <span className="text-color-muted">Leverage:</span>
              <button className="rounded border border-color-border px-3 py-1 font-semibold hover:border-accent transition-colors">
                10x
              </button>
              <button className="rounded border border-color-border px-3 py-1 font-semibold hover:border-accent transition-colors">
                20x
              </button>
              <button className="rounded border border-color-border px-3 py-1 font-semibold hover:border-accent transition-colors">
                50x
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Trading Interface */}
      <div className="grid gap-0 lg:grid-cols-[300px_1fr_350px]">
        {/* Left Sidebar - Pairs List */}
        <div className="border-r border-color-border bg-color-surface">
          <div className="border-b border-color-border p-4">
            <input
              type="text"
              placeholder="Search pairs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-color-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
            />
          </div>
          <div className="h-[calc(100vh-280px)] overflow-y-auto">
            {filteredPairs.map((ticker) => {
              const isSelected = ticker.symbol === selectedPair;
              const change = Number(ticker.priceChangePercent);
              return (
                <button
                  key={ticker.symbol}
                  onClick={() => setSelectedPair(ticker.symbol)}
                  className={`w-full border-b border-color-border px-4 py-3 text-left transition-colors ${
                    isSelected
                      ? "bg-accent/10 border-l-2 border-l-accent"
                      : "hover:bg-color-muted/5"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">
                        {ticker.symbol.replace("USDT", "")}
                        <span className="text-color-muted">/USDT</span>
                      </p>
                      <p className="text-xs text-color-muted mt-1">
                        Vol {Number(ticker.volume).toFixed(0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatCurrency(Number(ticker.lastPrice))}
                      </p>
                      <p
                        className={`text-xs font-semibold ${
                          change >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {change >= 0 ? "+" : ""}
                        {formatPercent(change)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Middle - Chart */}
        <div className="flex flex-col">
          {/* Price Header */}
          {currentTicker && (
            <div className="border-b border-color-border bg-color-surface px-6 py-4">
              <div className="flex items-center gap-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedPair.replace("USDT", "")}/USDT
                  </h2>
                  <p className="text-sm text-color-muted capitalize">{tradeType} Trading</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    {formatCurrency(Number(currentTicker.lastPrice))}
                  </span>
                  <span
                    className={`text-lg font-semibold ${
                      Number(currentTicker.priceChangePercent) >= 0
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {Number(currentTicker.priceChangePercent) >= 0 ? "+" : ""}
                    {formatPercent(Number(currentTicker.priceChangePercent))}
                  </span>
                </div>
              </div>
            </div>
          )}

          <TradingChart
            symbol={selectedPair}
            interval={interval}
            indicators={indicators}
            onIntervalChange={setInterval}
            onToggleIndicator={handleToggleIndicator}
          />
        </div>

        {/* Right Sidebar - Order Book & Trade Panel */}
        <div className="flex flex-col gap-0 border-l border-color-border">
          <OrderBook asks={orderBook.asks} bids={orderBook.bids} />
          <TradePanel
            tradeType={tradeType}
            symbol={selectedPair}
            lastPrice={currentTicker ? Number(currentTicker.lastPrice) : 0}
          />
        </div>
      </div>

      {/* Recent Trades */}
      <div className="border-t border-color-border bg-color-surface px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-color-muted">
            Recent Trades
          </h3>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {recentTrades.slice(0, 8).map((trade) => (
            <div
              key={trade.id}
              className="rounded-lg border border-color-border p-3"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-bold ${
                    trade.isBuyerMaker ? "text-rose-400" : "text-emerald-400"
                  }`}
                >
                  {formatCurrency(Number(trade.price))}
                </span>
                <span className="text-xs text-color-muted">
                  {Number(trade.qty).toFixed(4)}
                </span>
              </div>
              <p className="mt-1 text-xs text-color-muted">
                {new Date(trade.time).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Running Trades */}
      <div className="border-t border-color-border bg-color-surface px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-color-muted">
            Running Trades
          </h3>
          <div className="text-right text-xs font-semibold">
            <span className={`mr-3 ${unrealizedTotal >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              Unrealized: {unrealizedTotal >= 0 ? "+" : ""}${unrealizedTotal.toFixed(2)}
            </span>
            <span className={`${realizedTotal >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              Realized: {realizedTotal >= 0 ? "+" : ""}${realizedTotal.toFixed(2)}
            </span>
          </div>
        </div>
        <div className="grid gap-3">
          {portfolioTrades.length === 0 ? (
            <div className="rounded-lg border border-color-border px-4 py-6 text-center text-sm text-color-muted">
              No running trades yet
            </div>
          ) : (
            portfolioTrades.slice(0, 8).map((trade) => {
              const baseAsset = trade.symbol.replace("USDT", "");
              const currentPrice = lastPrices[baseAsset] || 0;
              const pnlValue = trade.side === "buy"
                ? (currentPrice - trade.price) * trade.quantity
                : (trade.price - currentPrice) * trade.quantity;
              const pnlPercent = trade.price
                ? (pnlValue / (trade.price * trade.quantity)) * 100
                : 0;
              const pnlPositive = pnlValue >= 0;
              const amountLabel = trade.side === "buy"
                ? `${trade.amount.toFixed(2)} USDT`
                : `${trade.amount.toFixed(6)} ${baseAsset}`;
              return (
                <div
                  key={trade.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-color-border px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {baseAsset}/USDT
                      <span className={`ml-2 text-xs font-semibold ${trade.side === "buy" ? "text-emerald-400" : "text-rose-400"}`}>
                        {trade.side.toUpperCase()}
                      </span>
                    </p>
                    <p className="text-xs text-color-muted">
                      {new Date(trade.timestamp).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[25, 50, 75, 100].map((percent) => (
                        <button
                          key={percent}
                          onClick={() => handleClosePercent(baseAsset, percent)}
                          className="rounded-full border border-color-border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-color-muted hover:border-accent"
                        >
                          {percent}%
                        </button>
                      ))}
                    </div>
                    {closeFeedback[baseAsset] && (
                      <p className="mt-2 text-[10px] font-semibold text-color-muted">
                        {closeFeedback[baseAsset]}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">${trade.price.toFixed(2)}</p>
                    <p className="text-xs text-color-muted">{amountLabel}</p>
                    <p className={`text-xs font-semibold ${pnlPositive ? "text-emerald-400" : "text-rose-400"}`}>
                      {pnlPositive ? "+" : ""}${pnlValue.toFixed(2)} ({pnlPositive ? "+" : ""}{pnlPercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <AIBotPanel
        symbol={selectedPair}
        interval={interval}
        indicators={indicators}
        lastPrice={currentTicker ? Number(currentTicker.lastPrice) : 0}
        changePercent={currentTicker ? Number(currentTicker.priceChangePercent) : 0}
      />
    </main>
  );
}
