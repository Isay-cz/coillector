import type { SolicitudEstado } from "@/lib/types";

export type PagoKind = "none" | "pendiente" | "ok" | "error";

export function pagoKind(s: Pick<SolicitudEstado, "confirmacion_id" | "estado_pago">): PagoKind {
  if (!s.confirmacion_id) return "none";
  if (s.estado_pago === "simulado_ok") return "ok";
  if (s.estado_pago === "error") return "error";
  return "pendiente";
}

/** ¿El estado ya no va a cambiar? (pagado o con error). */
export function isFinal(s: Pick<SolicitudEstado, "confirmacion_id" | "estado_pago">) {
  const k = pagoKind(s);
  return k === "ok" || k === "error";
}

export const ESTADO_PENDIENTE = "Pendiente de recolección";
