import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  backHref,
  action,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  backHref?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-5 flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="-ml-1 mb-2 inline-flex h-9 items-center gap-1 rounded-lg px-1 text-sm font-medium text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-4" aria-hidden /> Volver
          </Link>
        )}
        <h1 className="text-2xl font-bold leading-tight md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
