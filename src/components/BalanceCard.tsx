type BalanceCardProps = {
  label: string;
  value: string;
  change?: string;
};

export default function BalanceCard({ label, value, change }: BalanceCardProps) {
  return (
    <div className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-[color:var(--color-foreground)]">
        {value}
      </p>
      {change ? (
        <p className="mt-2 text-sm text-emerald-400">{change}</p>
      ) : null}
    </div>
  );
}
