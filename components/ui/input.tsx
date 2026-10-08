import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-xl border border-border bg-card px-4 text-base text-ink shadow-xs transition-colors duration-150 placeholder:text-muted/70 focus-visible:border-amber focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-amber/25 disabled:opacity-60 aria-invalid:border-danger aria-invalid:ring-danger/20",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
