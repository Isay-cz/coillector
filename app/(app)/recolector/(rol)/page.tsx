import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { ESTADO_PENDIENTE } from "@/lib/solicitud";
import { createClient } from "@/lib/supabase/server";
import { Pendientes } from "./pendientes";

export const metadata: Metadata = { title: "Pendientes" };

export default async function RecolectorHome() {
  const perfil = await requireRole("recolector");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("solicitudes_estado")
    .select("*")
    .eq("estado_recoleccion", ESTADO_PENDIENTE)
    .order("created_at", { ascending: true });
  if (error) console.error("[Coillector] pendientes:", error);
  return <Pendientes nombre={perfil.nombre} initial={data ?? []} />;
}
