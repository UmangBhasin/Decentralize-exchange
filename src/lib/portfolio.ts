import { doc, getDoc, setDoc } from "firebase/firestore";
import { firebaseAuth, firebaseDb } from "@/lib/firebase";

export type PortfolioTrade = {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  price: number;
  amount: number;
  quantity: number;
  total: number;
  timestamp: number;
};

export type PositionSummary = {
  symbol: string;
  quantity: number;
  avgEntry: number;
  costBasis: number;
  lastPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  realizedPnl: number;
};

export type PortfolioState = {
  balances: Record<string, number>;
  lastPrices: Record<string, number>;
  trades: PortfolioTrade[];
};

const STORAGE_KEY = "exchange-portfolio";

const DEFAULT_STATE: PortfolioState = {
  balances: {
    USDT: 12540.5,
    BTC: 0.82,
    ETH: 12.4,
    SOL: 220,
  },
  lastPrices: {},
  trades: [],
};

const isBrowser = () => typeof window !== "undefined";
const getUserId = () => firebaseAuth?.currentUser?.uid ?? null;

const normalizeState = (state: PortfolioState): PortfolioState => {
  return {
    balances: state.balances || {},
    lastPrices: state.lastPrices || {},
    trades: state.trades || [],
  };
};

const safeParse = (value: string | null) => {
  if (!value) return null;
  try {
    return JSON.parse(value) as PortfolioState;
  } catch {
    return null;
  }
};

export const getPortfolio = (): PortfolioState => {
  if (!isBrowser()) return DEFAULT_STATE;
  const stored = safeParse(window.localStorage.getItem(STORAGE_KEY));
  if (!stored || !stored.balances) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATE));
    return DEFAULT_STATE;
  }
  return normalizeState(stored);
};

const savePortfolio = (state: PortfolioState) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const savePortfolioRemote = async (state: PortfolioState) => {
  const uid = getUserId();
  if (!uid || !firebaseDb) return;
  try {
    await setDoc(doc(firebaseDb, "portfolios", uid), state, { merge: true });
  } catch (error) {
    console.error("Failed to persist portfolio:", error);
  }
};

export const hydratePortfolio = async (): Promise<PortfolioState> => {
  const local = getPortfolio();
  const uid = getUserId();
  if (!uid || !firebaseDb) return local;

  try {
    const snapshot = await getDoc(doc(firebaseDb, "portfolios", uid));
    if (snapshot.exists()) {
      const remote = normalizeState(snapshot.data() as PortfolioState);
      savePortfolio(remote);
      if (isBrowser()) {
        window.dispatchEvent(new Event("portfolio:update"));
      }
      return remote;
    }

    await savePortfolioRemote(local);
  } catch (error) {
    console.error("Failed to hydrate portfolio:", error);
  }

  return local;
};

export type PlaceOrderResult = {
  state: PortfolioState;
  error?: string;
};

export type ClosePositionResult = PlaceOrderResult;

const buildAverageCostMap = (trades: PortfolioTrade[]) => {
  const sorted = [...trades].sort((a, b) => a.timestamp - b.timestamp);
  const map = new Map<string, { quantity: number; cost: number; realized: number }>();

  sorted.forEach((trade) => {
    const baseAsset = trade.symbol.replace("USDT", "");
    const current = map.get(baseAsset) || { quantity: 0, cost: 0, realized: 0 };

    if (trade.side === "buy") {
      const newQuantity = current.quantity + trade.quantity;
      const newCost = current.cost + trade.quantity * trade.price;
      map.set(baseAsset, { quantity: newQuantity, cost: newCost, realized: current.realized });
      return;
    }

    if (trade.side === "sell" && current.quantity > 0) {
      const avgEntry = current.cost / current.quantity;
      const realized = current.realized + (trade.price - avgEntry) * trade.quantity;
      const newQuantity = Math.max(0, current.quantity - trade.quantity);
      const newCost = Math.max(0, current.cost - trade.quantity * avgEntry);
      map.set(baseAsset, { quantity: newQuantity, cost: newCost, realized });
    }
  });

  return map;
};

export const getPositionSummaries = (): PositionSummary[] => {
  const state = getPortfolio();
  const avgCostMap = buildAverageCostMap(state.trades || []);

  return Object.entries(state.balances)
    .filter(([symbol]) => symbol !== "USDT")
    .map(([symbol, quantity]) => {
      const avgCost = avgCostMap.get(symbol) || { quantity: 0, cost: 0, realized: 0 };
      const avgEntry = avgCost.quantity > 0 ? avgCost.cost / avgCost.quantity : 0;
      const costBasis = avgCost.cost;
      const lastPrice = state.lastPrices[symbol] || 0;
      const unrealizedPnl = avgEntry && lastPrice
        ? (lastPrice - avgEntry) * quantity
        : 0;
      const unrealizedPnlPercent = avgEntry
        ? ((lastPrice - avgEntry) / avgEntry) * 100
        : 0;

      return {
        symbol,
        quantity,
        avgEntry,
        costBasis,
        lastPrice,
        unrealizedPnl,
        unrealizedPnlPercent,
        realizedPnl: avgCost.realized,
      };
    })
    .sort((a, b) => a.symbol.localeCompare(b.symbol));
};

export const setLastPrice = (symbol: string, price: number, notify = true): PortfolioState => {
  const normalizedPrice = Number(price);
  if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
    return getPortfolio();
  }

  const baseAsset = symbol.replace("USDT", "");
  const state = getPortfolio();
  const updated: PortfolioState = {
    ...state,
    lastPrices: {
      ...state.lastPrices,
      [baseAsset]: normalizedPrice,
    },
  };

  savePortfolio(updated);
  if (isBrowser() && notify) {
    window.dispatchEvent(new Event("portfolio:update"));
  }

  return updated;
};

export const closePositionPercent = (params: {
  symbol: string;
  percent: number;
  price?: number;
}): ClosePositionResult => {
  const { symbol, percent, price } = params;
  const normalizedPercent = Number(percent);
  if (!Number.isFinite(normalizedPercent) || normalizedPercent <= 0 || normalizedPercent > 100) {
    return { state: getPortfolio(), error: "Percent must be between 1 and 100." };
  }

  const state = getPortfolio();
  const baseAsset = symbol.replace("USDT", "");
  const availableBase = state.balances[baseAsset] || 0;
  if (availableBase <= 0) {
    return { state, error: `No ${baseAsset} balance available.` };
  }

  const resolvedPrice = Number.isFinite(Number(price)) && Number(price) > 0
    ? Number(price)
    : state.lastPrices[baseAsset] || 0;
  if (!resolvedPrice) {
    return { state, error: "Price unavailable for profit booking." };
  }

  const amountToSell = (availableBase * normalizedPercent) / 100;
  return placeSpotOrder({
    symbol: `${baseAsset}USDT`,
    side: "sell",
    price: resolvedPrice,
    amount: amountToSell,
  });
};

export const placeSpotOrder = (params: {
  symbol: string;
  side: "buy" | "sell";
  price: number;
  amount: number;
}): PlaceOrderResult => {
  const { symbol, side, price, amount } = params;
  const baseAsset = symbol.replace("USDT", "");
  const state = getPortfolio();
  const balances = { ...state.balances };

  const normalizedPrice = Number(price);
  const normalizedAmount = Number(amount);
  if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
    return { state, error: "Invalid price." };
  }
  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    return { state, error: "Invalid amount." };
  }

  const quantity = side === "buy" ? normalizedAmount / normalizedPrice : normalizedAmount;
  const total = side === "buy" ? normalizedAmount : normalizedAmount * normalizedPrice;

  const availableUsdt = balances.USDT || 0;
  const availableBase = balances[baseAsset] || 0;

  if (side === "buy" && total > availableUsdt) {
    return { state, error: "Insufficient USDT balance." };
  }
  if (side === "sell" && quantity > availableBase) {
    return { state, error: `Insufficient ${baseAsset} balance.` };
  }

  balances.USDT = (balances.USDT || 0) + (side === "buy" ? -total : total);
  balances[baseAsset] = (balances[baseAsset] || 0) + (side === "buy" ? quantity : -quantity);

  const trade: PortfolioTrade = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    symbol,
    side,
    price: normalizedPrice,
    amount: normalizedAmount,
    quantity,
    total,
    timestamp: Date.now(),
  };

  const updated: PortfolioState = {
    balances,
    lastPrices: {
      ...state.lastPrices,
      [baseAsset]: normalizedPrice,
    },
    trades: [trade, ...state.trades].slice(0, 50),
  };

  savePortfolio(updated);
  if (isBrowser()) {
    window.dispatchEvent(new Event("portfolio:update"));
  }

  void savePortfolioRemote(updated);

  return { state: updated };
};
