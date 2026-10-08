import { Droplet } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  tone = "dark",
  size = "md",
}: {
  className?: string;
  tone?: "dark" | "light";
  size?: "sm" | "md" | "lg";
}) {
  const text = { sm: "text-lg", md: "text-xl", lg: "text-3xl" }[size];
  const icon = { sm: "size-5", md: "size-6", lg: "size-8" }[size];
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <Droplet className={cn(icon, "fill-amber text-amber")} strokeWidth={1.75} aria-hidden />
      <span
        className={cn(
          "font-display font-bold tracking-tight",
          text,
          tone === "light" ? "text-white" : "text-forest dark:text-ink",
        )}
      >
        Coillector
      </span>
    </span>
  );
}
