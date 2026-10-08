import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-24 w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-ink shadow-xs transition-colors duration-150 placeholder:text-muted/70 focus-visible:border-amber focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-amber/25 aria-invalid:border-danger",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
