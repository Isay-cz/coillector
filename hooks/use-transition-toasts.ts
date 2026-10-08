"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { formatMXN } from "@/lib/format";
import { pagoKind } from "@/lib/solicitud";
import type { SolicitudEstado } from "@/lib/types";

/** Avisa con un toast cuando una solicitud pasa a "Recolectada" o cambia el estado del pago. */
export function useTransitionToasts(rows: SolicitudEstado[]) {
  const prev = useRef<Map<string, SolicitudEstado> | null>(null);

  useEffect(() => {
    const current = new Map(rows.filter((r) => r.id).map((r) => [r.id as string, r]));
    if (prev.current) {
      for (const [id, now] of current) {
        const before = prev.current.get(id);
        if (!before) continue;
        if (!before.confirmacion_id && now.confirmacion_id) {
          toast.success(`¡Recolectaron tu aceite! ${now.litros_reales ?? ""} L`.trim());
        }
        const a = pagoKind(before);
        const b = pagoKind(now);
        if (a !== "ok" && b === "ok") toast.success(`Pago recibido: ${formatMXN(now.importe_mxn)}`);
        if (a !== "error" && b === "error") toast.error("Hubo un error en el pago simulado.");
      }
    }
    prev.current = current;
  }, [rows]);
}
