import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SolicitudesVendedor } from "./solicitudes-vendedor";

export const metadata: Metadata = { title: "Mis solicitudes" };

export default async function VendedorHome() {
  const perfil = await requireRole("vendedor");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("solicitudes_estado")
    .select("*")
    .eq("vendedor_id", perfil.id)
    .order("created_at", { ascending: false });
  if (error) console.error("[Coillector] solicitudes vendedor:", error);

  return <SolicitudesVendedor userId={perfil.id} nombre={perfil.nombre} initial={data ?? []} />;
}
