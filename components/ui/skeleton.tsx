import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("animate-pulse rounded-lg bg-ink/8", className)} aria-hidden {...props} />;
}

export { Skeleton };
