import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { requireRole } from "@/lib/auth";
import { NuevaSolicitudForm } from "./nueva-solicitud-form";

export const metadata: Metadata = { title: "Nueva solicitud" };

export default async function NuevaSolicitudPage() {
  const perfil = await requireRole("vendedor");
  return (
    <div className="mx-auto max-w-xl animate-fade-in">
      <PageHeader
        backHref="/vendedor"
        title="Nueva solicitud"
        description="Dinos cuánto aceite tienes y un recolector pasará por él."
      />
      <NuevaSolicitudForm
        defaults={{
          nombre_comercio: perfil.nombre_comercio ?? "",
          direccion: perfil.direccion ?? "",
          telefono: perfil.telefono ?? "",
        }}
      />
    </div>
  );
}
