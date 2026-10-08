import { requireRole } from "@/lib/auth";

// La ruta /recolector/solicitud/[id] queda fuera de este grupo: un vendedor que
// escanee el QR ve una pantalla amable en lugar de ser redirigido.
export default async function RecolectorLayout({ children }: { children: React.ReactNode }) {
  await requireRole("recolector");
  return children;
}
