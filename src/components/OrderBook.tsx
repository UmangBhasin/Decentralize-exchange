export type OrderBookRow = {
  price: number;
  size: number;
  total: number;
};

type OrderBookProps = {
  asks: OrderBookRow[];
  bids: OrderBookRow[];
};

export default function OrderBook({ asks, bids }: OrderBookProps) {
  return (
    <div className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
            Order book
          </p>
          <p className="text-lg font-semibold text-[color:var(--color-foreground)]">
            Depth
          </p>
        </div>
        <span className="rounded-full border border-[color:var(--color-border)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
          Spot
        </span>
      </div>
      <div className="mt-4">
        <div className="grid grid-cols-3 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
          <span>Price</span>
          <span>Size</span>
          <span className="text-right">Total</span>
        </div>
        <div className="mt-3 space-y-2">
          {asks.map((ask) => (
            <div key={ask.price} className="grid grid-cols-3 text-sm">
              <span className="text-rose-400">{ask.price.toFixed(2)}</span>
              <span className="text-[color:var(--color-foreground)]">
                {ask.size.toFixed(4)}
              </span>
              <span className="text-right text-[color:var(--color-muted)]">
                {ask.total.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="my-4 h-px bg-[color:var(--color-border)]" />
        <div className="space-y-2">
          {bids.map((bid) => (
            <div key={bid.price} className="grid grid-cols-3 text-sm">
              <span className="text-emerald-400">{bid.price.toFixed(2)}</span>
              <span className="text-[color:var(--color-foreground)]">
                {bid.size.toFixed(4)}
              </span>
              <span className="text-right text-[color:var(--color-muted)]">
                {bid.total.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
