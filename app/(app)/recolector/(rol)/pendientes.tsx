"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, ClipboardList, Droplets, MessageSquareText, PartyPopper, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { RelativeTime } from "@/components/relative-time";
import { StatCard } from "@/components/stat-card";
import { ContactActions } from "@/components/solicitud/contact-actions";
import { Button } from "@/components/ui/button";
import { usePolling } from "@/hooks/use-polling";
import { useRealtimeRefetch } from "@/hooks/use-realtime-refetch";
import { formatLitros, formatNumber } from "@/lib/format";
import { ESTADO_PENDIENTE } from "@/lib/solicitud";
import { createClient } from "@/lib/supabase/client";
import type { SolicitudEstado } from "@/lib/types";

export function Pendientes({ nombre, initial }: { nombre: string | null; initial: SolicitudEstado[] }) {
  const [rows, setRows] = useState(initial);
  const known = useRef(new Set(initial.map((r) => r.id)));

  const refetch = useCallback(async () => {
    const { data, error } = await createClient()
      .from("solicitudes_estado")
      .select("*")
      .eq("estado_recoleccion", ESTADO_PENDIENTE)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("[Coillector] refetch pendientes:", error);
      return;
    }
    setRows(data ?? []);
  }, []);

  useEffect(() => {
    for (const r of rows) {
      if (!known.current.has(r.id)) {
        toast.info(`Nueva solicitud: ${r.nombre_comercio} · ${formatLitros(r.litros_estimados)}`);
        known.current.add(r.id);
      }
    }
  }, [rows]);

  useRealtimeRefetch(
    "recolector-pendientes",
    [
      { table: "solicitudes", event: "INSERT" },
      { table: "confirmaciones", event: "INSERT" },
    ],
    refetch,
  );
  usePolling(refetch, 15000);

  const litros = rows.reduce((acc, r) => acc + Number(r.litros_estimados ?? 0), 0);

  return (
    <div className="animate-fade-in">
      <div className="mb-5">
        <p className="text-sm text-muted">Hola{nombre ? `, ${nombre.split(" ")[0]}` : ""} 👋</p>
        <h1 className="text-2xl font-bold md:text-3xl">Recolecciones pendientes</h1>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-[1fr_1fr_1.2fr] md:gap-4">
        <div className="grid grid-cols-2 gap-3 md:contents">
          <StatCard label="Pendientes" value={formatNumber(rows.length)} icon={ClipboardList} tone="warning" />
          <StatCard label="Litros estimados" value={formatLitros(litros)} icon={Droplets} tone="amber" />
        </div>
        <Button asChild variant="amber" size="lg" className="h-auto min-h-16 rounded-2xl text-lg shadow-float md:h-full">
          <Link href="/recolector/escanear">
            <ScanLine className="!size-6" aria-hidden /> Escanear QR
          </Link>
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={PartyPopper}
          title="Todo recolectado"
          description="No hay solicitudes pendientes. Esta lista se actualiza sola cuando un vendedor pida una recolección."
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {rows.map((s) => (
            <li key={s.id}>
              <PendienteCard s={s} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PendienteCard({ s }: { s: SolicitudEstado }) {
  return (
    <article className="group relative animate-fade-in rounded-2xl border border-border bg-card p-4 shadow-card transition-colors duration-150 hover:border-amber/70">
      <Link href={`/recolector/solicitud/${s.id}`} className="absolute inset-0 rounded-2xl" aria-label={`Ver solicitud de ${s.nombre_comercio}`} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate font-sans text-base font-semibold">{s.nombre_comercio}</h2>
          <p className="mt-0.5 line-clamp-2 text-sm text-muted">{s.direccion}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-xl font-bold tabular-nums leading-none">
            {formatNumber(s.litros_estimados)}
            <span className="ml-0.5 text-sm font-semibold text-muted">L</span>
          </p>
          <p className="mt-1 text-xs text-muted">
            <RelativeTime date={s.created_at} />
          </p>
        </div>
      </div>
      {s.notas && (
        <p className="mt-3 flex gap-2 rounded-xl bg-amber-soft/70 px-3 py-2 text-sm text-ink">
          <MessageSquareText className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
          <span className="line-clamp-2">{s.notas}</span>
        </p>
      )}
      <div className="relative z-10 mt-3 flex items-center gap-2">
        <ContactActions direccion={s.direccion} telefono={s.telefono_contacto} size="sm" className="flex-1" />
        <ChevronRight className="pointer-events-none size-5 shrink-0 text-muted" aria-hidden />
      </div>
    </article>
  );
}
