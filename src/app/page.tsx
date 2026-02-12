import MarketDashboard from "@/components/MarketDashboard";
import type { MarketCoin } from "@/lib/market";

export const revalidate = 60;

async function getMarketData(): Promise<MarketCoin[]> {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h",
      { next: { revalidate } }
    );

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as MarketCoin[];
  } catch {
    return [];
  }
}

export default async function Home() {
  const coins = await getMarketData();

  return <MarketDashboard coins={coins} />;
}
