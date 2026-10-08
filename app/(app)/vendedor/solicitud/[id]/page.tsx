import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/types";
import { DetalleVendedor } from "./detalle-vendedor";

export const metadata: Metadata = { title: "Detalle de solicitud" };

export default async function DetalleSolicitudVendedorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const supabase = await createClient();
  const { data, error } = await supabase.from("solicitudes_estado").select("*").eq("id", id).maybeSingle();
  if (error) console.error("[Coillector] detalle vendedor:", error);
  if (!data) notFound();
  return <DetalleVendedor initial={data} />;
}
