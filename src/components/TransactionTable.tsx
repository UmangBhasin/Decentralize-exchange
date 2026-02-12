const transactions = [
  { id: "tx-1", type: "Deposit", asset: "USDT", amount: "+4,200", date: "Feb 10" },
  { id: "tx-2", type: "Trade", asset: "BTC", amount: "-0.12", date: "Feb 09" },
  { id: "tx-3", type: "Withdraw", asset: "ETH", amount: "-1.8", date: "Feb 08" },
];

export default function TransactionTable() {
  return (
    <div className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
            History
          </p>
          <p className="text-lg font-semibold text-[color:var(--color-foreground)]">
            Recent transactions
          </p>
        </div>
        <button className="rounded-full border border-[color:var(--color-border)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
          Export
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {transactions.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-2xl border border-[color:var(--color-border)] px-4 py-3 text-sm"
          >
            <div>
              <p className="font-semibold text-[color:var(--color-foreground)]">
                {item.type}
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
                {item.asset}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-[color:var(--color-foreground)]">
                {item.amount}
              </p>
              <p className="text-xs text-[color:var(--color-muted)]">
                {item.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
