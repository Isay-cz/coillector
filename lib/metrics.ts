import { createClient } from "@/lib/supabase/server";
import type { RecoleccionDia, ResumenPublico, ResumenUsuario } from "@/lib/types";

export const RESUMEN_VACIO: ResumenPublico = {
  litros_recolectados: 0,
  estimacion_agua_l: 0,
  recompensa_simulada_mxn: 0,
  recolecciones: 0,
  solicitudes_totales: 0,
  pendientes: 0,
  vendedores: 0,
  recolectores: 0,
};

export async function getResumenPublico(): Promise<ResumenPublico> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("resumen_publico").select("*").maybeSingle();
  if (error) console.error("[Coillector] resumen_publico:", error);
  return data ?? RESUMEN_VACIO;
}

export async function getRecoleccionesPorDia(): Promise<RecoleccionDia[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("recolecciones_por_dia").select("*").order("dia", { ascending: true });
  if (error) console.error("[Coillector] recolecciones_por_dia:", error);
  return data ?? [];
}

export async function getResumenUsuario(): Promise<ResumenUsuario | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("resumen_mvp_vista").select("*").maybeSingle();
  if (error) console.error("[Coillector] resumen_mvp_vista:", error);
  return data ?? null;
}
