import { MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function mapsUrl(direccion: string | null | undefined) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${direccion ?? ""}, CDMX`)}`;
}

/** Botones "Abrir en Maps" y "Llamar" (este último solo si hay teléfono). */
export function ContactActions({
  direccion,
  telefono,
  className,
  size = "default",
}: {
  direccion: string | null;
  telefono: string | null;
  className?: string;
  size?: "default" | "sm";
}) {
  return (
    <div className={cn("grid gap-2", telefono ? "grid-cols-2" : "grid-cols-1", className)}>
      <Button asChild variant="outline" size={size}>
        <a href={mapsUrl(direccion)} target="_blank" rel="noopener noreferrer">
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
