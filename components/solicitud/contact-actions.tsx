import { MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mapsUrl } from "@/lib/geo";
import { cn } from "@/lib/utils";

/** Botones "Abrir en Maps" (con coordenadas si las hay) y "Llamar" (este último solo si hay teléfono). */
export function ContactActions({
  direccion,
  lat,
  lng,
  telefono,
  className,
  size = "default",
}: {
  direccion: string | null;
  lat?: number | null;
  lng?: number | null;
  telefono: string | null;
  className?: string;
  size?: "default" | "sm";
}) {
  return (
    <div className={cn("grid gap-2", telefono ? "grid-cols-2" : "grid-cols-1", className)}>
      <Button asChild variant="outline" size={size}>
        <a href={mapsUrl({ lat, lng, direccion })} target="_blank" rel="noopener noreferrer">
          <MapPin aria-hidden /> Abrir en Maps
        </a>
      </Button>
      {telefono && (
        <Button asChild variant="outline" size={size}>
          <a href={`tel:${telefono}`}>
            <Phone aria-hidden /> Llamar
          </a>
        </Button>
      )}
    </div>
  );
}
