import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Escaner } from "./escaner";

export const metadata: Metadata = { title: "Escanear QR" };

export default function EscanearPage() {
  return (
    <div className="mx-auto max-w-md animate-fade-in">
      <PageHeader backHref="/recolector" title="Escanear QR" description="Apunta al código que te muestra el vendedor." />
      <Escaner />
    </div>
  );
}
