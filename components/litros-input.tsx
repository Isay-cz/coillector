"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const fmt = (n: number) => String(Math.round(n * 100) / 100);

/** Campo de litros con stepper (+/−), teclado decimal y atajos. */
export function LitrosInput({
  id,
  value,
  onChange,
  invalid,
  describedBy,
  presets = [10, 20, 50],
  step = 1,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  describedBy?: string;
  presets?: number[];
  step?: number;
}) {
  const current = Number(value.replace(",", "."));
  const base = Number.isFinite(current) ? current : 0;
  const bump = (delta: number) => {
    const next = Math.min(1000, Math.max(0, Math.round((base + delta) * 100) / 100));
    onChange(next === 0 ? "" : fmt(next));
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          "flex h-16 items-stretch overflow-hidden rounded-2xl border bg-card shadow-xs transition-colors duration-150 focus-within:border-amber focus-within:ring-3 focus-within:ring-amber/25",
          invalid ? "border-danger" : "border-border",
        )}
      >
        <button
          type="button"
          onClick={() => bump(-step)}
          disabled={base <= 0}
          className="flex w-16 shrink-0 items-center justify-center text-ink transition-colors hover:bg-amber-soft/60 disabled:opacity-35"
          aria-label={`Restar ${step} litro`}
        >
          <Minus className="size-6" aria-hidden />
        </button>
        <div className="relative flex flex-1 items-center justify-center border-x border-border">
          <input
            id={id}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            value={value}
            onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, ""))}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className="w-full bg-transparent pr-8 text-center font-display text-3xl font-bold tabular-nums text-ink outline-none placeholder:text-muted/40"
          />
          <span className="pointer-events-none absolute right-4 font-display text-lg font-semibold text-muted">L</span>
        </div>
        <button
          type="button"
          onClick={() => bump(step)}
          disabled={base >= 1000}
          className="flex w-16 shrink-0 items-center justify-center text-ink transition-colors hover:bg-amber-soft/60 disabled:opacity-35"
          aria-label={`Sumar ${step} litro`}
        >
          <Plus className="size-6" aria-hidden />
        </button>
      </div>
      {presets.length > 0 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Cantidades rápidas">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChange(String(p))}
              className={cn(
                "h-9 rounded-full border px-4 text-sm font-medium tabular-nums transition-colors duration-150",
                base === p ? "border-amber bg-amber-soft text-ink" : "border-border bg-card text-muted hover:text-ink",
              )}
            >
              {p} L
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
