import { AlertTriangle, Check, ClipboardCheck, Coins, Loader2, Truck } from "lucide-react";
import { RelativeTime } from "@/components/relative-time";
import { formatLitros, formatMXN } from "@/lib/format";
import { pagoKind } from "@/lib/solicitud";
import type { SolicitudEstado } from "@/lib/types";
import { cn } from "@/lib/utils";

type StepState = "done" | "current" | "pending" | "error";

function Step({
  state,
  icon: Icon,
  title,
  children,
  last,
}: {
  state: StepState;
  icon: typeof Check;
  title: string;
  children?: React.ReactNode;
  last?: boolean;
}) {
  return (
    <li className="relative flex gap-4 pb-6 last:pb-0" aria-current={state === "current" ? "step" : undefined}>
      {!last && (
        <span
          className={cn(
            "absolute left-5 top-11 bottom-1 w-0.5 -translate-x-1/2 rounded-full transition-colors duration-200",
            state === "done" ? "bg-success" : "bg-border",
          )}
          aria-hidden
        />
      )}
      <span
        className={cn(
          "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200",
          state === "done" && "border-success bg-success text-white",
          state === "current" && "animate-pulse-ring border-amber bg-amber-soft text-warning",
          state === "pending" && "border-border bg-card text-muted",
          state === "error" && "border-danger bg-danger-soft text-danger",
        )}
      >
        {state === "done" ? <Check className="size-5" aria-hidden /> : <Icon className="size-5" aria-hidden />}
      </span>
      <div className="min-w-0 pt-1.5">
        <p className={cn("font-semibold", state === "pending" && "text-muted")}>{title}</p>
        <div className="mt-0.5 text-sm text-muted">{children}</div>
      </div>
    </li>
  );
}

/** Solicitada → Recolectada → Pago simulado. */
export function Timeline({ s }: { s: SolicitudEstado }) {
  const pago = pagoKind(s);
  const recolectada = Boolean(s.confirmacion_id);
  return (
    <ol aria-label="Progreso de la solicitud">
      <Step state="done" icon={ClipboardCheck} title="Solicitada">
        {formatLitros(s.litros_estimados)} estimados · <RelativeTime date={s.created_at} />
      </Step>
      <Step state={recolectada ? "done" : "current"} icon={Truck} title="Recolectada">
        {recolectada ? (
          <>
            {formatLitros(s.litros_reales)} reales · <RelativeTime date={s.confirmada_at} />
          </>
        ) : (
          "Esperando al recolector"
        )}
      </Step>
      <Step
        state={pago === "ok" ? "done" : pago === "error" ? "error" : pago === "pendiente" ? "current" : "pending"}
        icon={pago === "error" ? AlertTriangle : pago === "pendiente" ? Loader2 : Coins}
        title={pago === "ok" ? "Pago simulado enviado" : pago === "error" ? "Error en el pago simulado" : "Pago simulado"}
        last
      >
        {pago === "ok" && (
          <>
            <span className="font-display text-base font-semibold tabular-nums text-success">{formatMXN(s.importe_mxn)}</span>
            <span className="block break-all">Ref. {s.referencia_pago}</span>
          </>
        )}
        {pago === "pendiente" && (
          <span className="inline-flex items-center gap-1.5 text-warning">
            <Loader2 className="size-3.5 animate-spin" aria-hidden /> Procesando pago…
          </span>
        )}
        {pago === "error" && <span className="text-danger">{s.error_pago || "No se pudo procesar el pago."}</span>}
        {pago === "none" && "Se envía al confirmar la recolección"}
      </Step>
    </ol>
  );
}
