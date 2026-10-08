import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="relative flex size-24 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-amber-soft" aria-hidden />
        <span className="absolute inset-3 rounded-full bg-amber/25" aria-hidden />
        <Icon className="relative size-10 text-warning" strokeWidth={1.75} aria-hidden />
      </div>
      <div className="max-w-xs space-y-1.5">
        <h2 className="text-xl font-bold">{title}</h2>
        {description && <p className="text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
