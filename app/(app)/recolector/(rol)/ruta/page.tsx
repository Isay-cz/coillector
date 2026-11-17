import type { Metadata } from "next";
import { ESTADO_PENDIENTE } from "@/lib/solicitud";
import { createClient } from "@/lib/supabase/server";
import { RutaSugerida } from "./ruta-sugerida";

export const metadata: Metadata = { title: "Ruta sugerida" };

export default async function RutaPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("solicitudes_estado")
    .select("*")
    .eq("estado_recoleccion", ESTADO_PENDIENTE)
    .order("created_at", { ascending: true });
  if (error) console.error("[Coillector] ruta:", error);
  return <RutaSugerida initial={data ?? []} />;
}
