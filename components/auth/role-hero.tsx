import { Droplet, Store, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "vendedor" | "recolector" | "neutral";

const CONFIG = {
  vendedor: { Icon: Store, chip: "Vendedor", bg: "bg-amber", fg: "text-[#1c1c1a]", ring: "bg-amber-soft" },
  recolector: { Icon: Truck, chip: "Recolector", bg: "bg-forest", fg: "text-white", ring: "bg-forest/10 dark:bg-white/10" },
  neutral: { Icon: Droplet, chip: null, bg: "bg-forest", fg: "text-amber", ring: "bg-amber-soft" },
} as const;

/** Encabezado visual por rol (tienda vs. camión) para login y registro. */
export function RoleHero({ variant, title, subtitle }: { variant: Variant; title: string; subtitle: string }) {
  const c = CONFIG[variant];
  return (
    <div className="mb-6 flex flex-col items-start gap-4 pt-2">
      <div className={cn("flex size-20 items-center justify-center rounded-3xl", c.ring)}>
        <div className={cn("flex size-14 items-center justify-center rounded-2xl shadow-sm", c.bg)}>
          <c.Icon className={cn("size-7", c.fg, variant === "neutral" && "fill-amber")} aria-hidden />
        </div>
      </div>
      <div>
        {c.chip && (
          <span className="mb-2 inline-flex rounded-full bg-amber-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-warning">
            {c.chip}
          </span>
        )}
        <h1 className="text-3xl font-bold leading-tight">{title}</h1>
        <p className="mt-1.5 text-muted">{subtitle}</p>
      </div>
    </div>
  );
}
