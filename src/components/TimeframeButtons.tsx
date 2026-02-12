"use client";

type TimeframeButtonsProps = {
  value: string;
  onChange: (interval: string) => void;
};

const timeframes = [
  { label: "1m", value: "1" },
  { label: "5m", value: "5" },
  { label: "30m", value: "30" },
  { label: "1h", value: "60" },
  { label: "4h", value: "240" },
  { label: "1D", value: "D" },
];

export default function TimeframeButtons({
  value,
  onChange,
}: TimeframeButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      {timeframes.map((frame) => (
        <button
          key={frame.value}
          onClick={() => onChange(frame.value)}
          className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
            value === frame.value
              ? "border-(--color-accent) bg-(--color-accent) text-(--color-accent-foreground)"
              : "border-(--color-border) text-(--color-muted) hover:border-(--color-accent)"
          }`}
        >
          {frame.label}
        </button>
      ))}
    </div>
  );
}
