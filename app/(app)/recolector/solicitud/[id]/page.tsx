import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ScanLine, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/types";
import { DetalleRecolector } from "./detalle-recolector";

export const metadata: Metadata = { title: "Confirmar recolección" };

// Destino del QR. Queda fuera del grupo (rol) para mostrar una pantalla amable a vendedores.
export default async function SolicitudRecolectorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const perfil = await getProfile();
  if (!perfil) redirect(`/login?rol=recolector&next=${encodeURIComponent(`/recolector/solicitud/${id}`)}`);
  if (!isUuid(id)) notFound();

  const supabase = await createClient();

  if (perfil.rol !== "recolector") {
    // RLS: el vendedor solo podrá leerla si es suya.
    const { data: propia } = await supabase.from("solicitudes_estado").select("id").eq("id", id).maybeSingle();
    return (
      <div className="mx-auto flex max-w-md animate-fade-in flex-col items-center gap-5 py-10 text-center">
        <div className="relative flex size-24 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-amber-soft" aria-hidden />
          <ScanLine className="relative size-10 text-warning" aria-hidden />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Este código lo escanea el recolector</h1>
          <p className="text-muted">
            Muéstraselo a la persona que recoge tu aceite. Cuando lo confirme, verás el pago en tu solicitud al instante.
          </p>
        </div>
        <Button asChild size="lg" className="w-full">
          <Link href={propia ? `/vendedor/solicitud/${id}` : "/vendedor"}>
            <Store aria-hidden /> {propia ? "Ver mi solicitud" : "Ir a mis solicitudes"}
          </Link>
        </Button>
      </div>
    );
  }

  const { data, error } = await supabase.from("solicitudes_estado").select("*").eq("id", id).maybeSingle();
  if (error) console.error("[Coillector] detalle recolector:", error);
  if (!data) notFound();
  return <DetalleRecolector initial={data} />;
}
