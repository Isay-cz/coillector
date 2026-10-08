import { AlertTriangle, CheckCircle2, Clock, Coins, Loader2 } from "lucide-react";
import { pagoKind } from "@/lib/solicitud";
import type { SolicitudEstado } from "@/lib/types";
import { cn } from "@/lib/utils";

type Kind = "pendiente" | "recolectada" | "pago-pendiente" | "pago-ok" | "pago-error";

const CHIP: Record<Kind, { label: string; className: string; Icon: typeof Clock; spin?: boolean }> = {
  pendiente: { label: "Pendiente de recolección", className: "bg-warning-soft text-warning", Icon: Clock },
  recolectada: { label: "Recolectada", className: "bg-success-soft text-success", Icon: CheckCircle2 },
  "pago-pendiente": { label: "Pago pendiente", className: "bg-warning-soft text-warning", Icon: Loader2, spin: true },
  "pago-ok": { label: "Pago completado", className: "bg-success-soft text-success", Icon: Coins },
  "pago-error": { label: "Error en el pago", className: "bg-danger-soft text-danger", Icon: AlertTriangle },
};

export function StatusChip({ kind, label, className }: { kind: Kind; label?: string; className?: string }) {
  const c = CHIP[kind];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold leading-none whitespace-nowrap",
        c.className,
        className,
      )}
    >
      <c.Icon className={cn("size-3.5 shrink-0", c.spin && "animate-spin")} aria-hidden />
      {label ?? c.label}
    </span>
  );
}

/** Chip de recolección + chip de pago (si aplica) para una solicitud. */
export function SolicitudChips({ s, className }: { s: SolicitudEstado; className?: string }) {
  const pago = pagoKind(s);
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      <StatusChip kind={s.confirmacion_id ? "recolectada" : "pendiente"} />
      {pago === "pendiente" && <StatusChip kind="pago-pendiente" />}
      {pago === "ok" && <StatusChip kind="pago-ok" />}
      {pago === "error" && <StatusChip kind="pago-error" />}
    </div>
  );
}
