import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { formatFecha, formatLitros, formatMXN } from "@/lib/format";
import { pagoKind } from "@/lib/solicitud";
import type { SolicitudEstado } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Estado del pago simulado + desglose de la entrega confirmada. */
export function Comprobante({ s, className }: { s: SolicitudEstado; className?: string }) {
  const pago = pagoKind(s);
  if (pago === "none") return null;
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-card shadow-card", className)}>
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "flex items-center gap-3 p-5 transition-colors duration-200",
          pago === "ok" && "bg-success-soft text-success",
          pago === "pendiente" && "bg-warning-soft text-warning",
          pago === "error" && "bg-danger-soft text-danger",
        )}
      >
        {pago === "ok" && <CheckCircle2 className="size-9 shrink-0 animate-fade-in" aria-hidden />}
        {pago === "pendiente" && <Loader2 className="size-9 shrink-0 animate-spin" aria-hidden />}
        {pago === "error" && <AlertTriangle className="size-9 shrink-0" aria-hidden />}
        <div className="min-w-0">
          {pago === "ok" && (
            <>
              <p className="font-display text-lg font-bold leading-tight">
                Pago de {formatMXN(s.importe_mxn)} MXN enviado
              </p>
              <p className="break-all text-sm opacity-90">Ref. {s.referencia_pago}</p>
            </>
          )}
          {pago === "pendiente" && (
            <>
              <p className="font-display text-lg font-bold leading-tight">Procesando pago…</p>
              <p className="text-sm opacity-90">La API de pago simulada responde en unos segundos.</p>
            </>
          )}
          {pago === "error" && (
            <>
              <p className="font-display text-lg font-bold leading-tight">No se pudo procesar el pago</p>
              <p className="text-sm opacity-90">{s.error_pago || "Error en el pago simulado."}</p>
            </>
          )}
        </div>
      </div>
      <dl className="divide-y divide-border text-sm">
        <Row label="Litros recolectados" value={formatLitros(s.litros_reales)} />
        <Row label="Tarifa demo" value={`${formatMXN(2)} / L`} />
        <Row
          label="Importe"
          value={pago === "ok" ? formatMXN(s.importe_mxn) : pago === "pendiente" ? "Calculando…" : "—"}
          strong
        />
        <Row label="Confirmada" value={formatFecha(s.confirmada_at)} />
      </dl>
      <p className="border-t border-border bg-cream/60 px-5 py-2.5 text-xs text-muted">
        Pago simulado (estilo CoDi/SPEI) para fines académicos. No se mueve dinero real.
      </p>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3">
      <dt className="text-muted">{label}</dt>
      <dd className={cn("text-right tabular-nums", strong ? "font-display text-base font-bold" : "font-medium")}>{value}</dd>
    </div>
  );
}
