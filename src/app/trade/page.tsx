import MarketHeader from "@/components/MarketHeader";
import TradingView from "@/components/TradingView";

export default function TradePage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketHeader active="trade" />
      <TradingView />
    </div>
  );
}
