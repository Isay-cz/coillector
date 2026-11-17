"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import type { MapaProps } from "./mapa-leaflet";

export type { MapaProps, MarcadorMapa } from "./mapa-leaflet";

const MapaLeaflet = dynamic(() => import("./mapa-leaflet"), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse bg-ink/5" aria-hidden />,
});

/** Mapa de OpenStreetMap (Leaflet). Solo se carga en el navegador. */
export function Mapa({ className, ...props }: MapaProps) {
  return (
    <div className={cn("relative isolate overflow-hidden rounded-xl border border-border bg-cream", className)}>
      <MapaLeaflet {...props} className="size-full" />
    </div>
  );
}
