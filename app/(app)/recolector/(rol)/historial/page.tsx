import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Historial } from "./historial";

export const metadata: Metadata = { title: "Historial" };

export default async function HistorialPage() {
  const perfil = await requireRole("recolector");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("solicitudes_estado")
    .select("*")
    .eq("recolector_id", perfil.id)
    .order("confirmada_at", { ascending: false });
  if (error) console.error("[Coillector] historial:", error);
  return <Historial userId={perfil.id} initial={data ?? []} />;
}
