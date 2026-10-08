"use client";

import { useCallback, useState } from "react";
import { usePolling } from "@/hooks/use-polling";
import { useRealtimeRefetch } from "@/hooks/use-realtime-refetch";
import { useTransitionToasts } from "@/hooks/use-transition-toasts";
import { isFinal, pagoKind } from "@/lib/solicitud";
import { createClient } from "@/lib/supabase/client";
import type { SolicitudEstado } from "@/lib/types";

/**
 * Mantiene una solicitud al día: realtime sobre su confirmación + polling de respaldo
 * (cada 2 s mientras el pago se procesa, cada 3 s mientras espera recolección).
 */
export function useSolicitudLive(initial: SolicitudEstado, { toasts = true }: { toasts?: boolean } = {}) {
  const [s, setS] = useState(initial);
  const id = initial.id as string;

  const refetch = useCallback(async () => {
    const { data, error } = await createClient().from("solicitudes_estado").select("*").eq("id", id).maybeSingle();
    if (error) {
      console.error("[Coillector] refetch solicitud:", error);
      return null;
    }
    if (data) setS(data);
    return data;
  }, [id]);

  const final = isFinal(s);
  useRealtimeRefetch(`solicitud-${id}`, [{ table: "confirmaciones", filter: `solicitud_id=eq.${id}` }], refetch, !final);
  const pagoEnProceso = pagoKind(s) === "pendiente";
  // Si Make no respondiera, dejamos de consultar tras 60 s (el canal realtime sigue abierto).
  usePolling(refetch, final ? null : pagoEnProceso ? 2000 : 3000, pagoEnProceso ? 60_000 : undefined);
  const rows = toasts ? [s] : [];
  useTransitionToasts(rows);

  return { s, setS, refetch };
}
