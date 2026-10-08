import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "forest",
  hint,
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  tone?: "forest" | "amber" | "success" | "warning";
  hint?: React.ReactNode;
  className?: string;
}) {
  const tones = {
    forest: "bg-forest/10 text-forest dark:bg-white/10 dark:text-ink",
    amber: "bg-amber-soft text-warning",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
  };
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 shadow-card", className)}>
      <div className="flex items-center gap-2">
        <span className={cn("flex size-8 items-center justify-center rounded-lg", tones[tone])}>
          <Icon className="size-4" aria-hidden />
        </span>
        <p className="text-xs font-medium leading-tight text-muted">{label}</p>
      </div>
      <p className="mt-3 font-display text-2xl font-bold tabular-nums leading-none tracking-tight md:text-3xl">{value}</p>
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}
