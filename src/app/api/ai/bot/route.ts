import { NextResponse } from "next/server";

type BotRequest = {
  symbol?: string;
  interval?: string;
  indicators?: string[];
  price?: number;
  changePercent?: number;
  modelId?: string;
};

type BotResponse = {
  signal: "buy" | "sell" | "wait";
  confidence: number;
  summary: string;
  rationale: string;
  indicatorsUsed: string[];
  modelId?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as BotRequest;
  const change = Number(body.changePercent ?? 0);
  const indicators = body.indicators ?? [];
  const modelId = body.modelId ?? "custom-model";

  let signal: BotResponse["signal"] = "wait";
  if (change > 0.6) {
    signal = "buy";
  } else if (change < -0.6) {
    signal = "sell";
  }

  const confidence = Math.min(0.92, Math.max(0.45, Math.abs(change) / 6 + 0.45));
  const summary = signal === "wait"
    ? "Market is ranging. Wait for confirmation."
    : signal === "buy"
      ? "Momentum is positive. Look for a long entry with tight risk."
      : "Momentum is negative. Look for a short entry with tight risk.";

  const rationale = `Indicators used: ${indicators.join(", ") || "none"}. `
    + `Change ${change.toFixed(2)}% on ${body.symbol ?? "symbol"} at interval ${body.interval ?? "n/a"}.`;

  return NextResponse.json({
    signal,
    confidence,
    summary,
    rationale,
    indicatorsUsed: indicators,
    modelId,
  } satisfies BotResponse);
}
