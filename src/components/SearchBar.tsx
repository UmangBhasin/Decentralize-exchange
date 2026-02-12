"use client";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search coins, pairs, or tokens",
}: SearchBarProps) {
  return (
    <div className="flex w-full items-center gap-3 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3">
      <span className="text-sm font-semibold text-[color:var(--color-muted)]">
        Search
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm font-medium text-[color:var(--color-foreground)] outline-none placeholder:text-[color:var(--color-muted)]"
      />
    </div>
  );
}
