import { ClipboardList, MapPin, MessageSquareText, Phone } from "lucide-react";
import { formatFecha, formatLitros } from "@/lib/format";
import type { SolicitudEstado } from "@/lib/types";

/** Datos de la solicitud (dirección, contacto, notas). */
export function DetallesSolicitud({ s }: { s: SolicitudEstado }) {
  return (
    <ul className="space-y-3 text-sm">
      <Item icon={MapPin} label="Dirección">
        {s.direccion}
      </Item>
      <Item icon={ClipboardList} label="Litros estimados">
        {formatLitros(s.litros_estimados)} · {formatFecha(s.created_at)}
      </Item>
      {s.telefono_contacto && (
        <Item icon={Phone} label="Teléfono">
          {s.telefono_contacto}
        </Item>
      )}
      {s.notas && (
        <Item icon={MessageSquareText} label="Notas">
          {s.notas}
        </Item>
      )}
    </ul>
  );
}

function Item({ icon: Icon, label, children }: { icon: typeof MapPin; label: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-soft text-warning">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted">{label}</p>
        <p className="break-words text-ink">{children}</p>
      </div>
    </li>
  );
}
