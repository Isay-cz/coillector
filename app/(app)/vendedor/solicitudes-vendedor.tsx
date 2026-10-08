"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ChevronRight, Clock, Droplet, ListChecks, Plus, Wallet } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { RelativeTime } from "@/components/relative-time";
import { StatCard } from "@/components/stat-card";
import { SolicitudChips } from "@/components/status-chip";
import { Button } from "@/components/ui/button";
import { usePolling } from "@/hooks/use-polling";
import { useRealtimeRefetch } from "@/hooks/use-realtime-refetch";
import { useTransitionToasts } from "@/hooks/use-transition-toasts";
import { formatMXN, formatNumber, shortId } from "@/lib/format";
import { pagoKind } from "@/lib/solicitud";
import { createClient } from "@/lib/supabase/client";
import type { SolicitudEstado } from "@/lib/types";

export function SolicitudesVendedor({
  userId,
  nombre,
  initial,
}: {
  userId: string;
  nombre: string | null;
  initial: SolicitudEstado[];
}) {
  const [rows, setRows] = useState(initial);

  const refetch = useCallback(async () => {
    const { data, error } = await createClient()
      .from("solicitudes_estado")
      .select("*")
      .eq("vendedor_id", userId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[Coillector] refetch solicitudes:", error);
      return;
    }
    setRows(data ?? []);
  }, [userId]);

  useRealtimeRefetch("vendedor-lista", [{ table: "confirmaciones" }, { table: "solicitudes", event: "INSERT" }], refetch);
  useTransitionToasts(rows);

  // Respaldo por si el canal en tiempo real tarda: más rápido mientras hay un pago en proceso.
  const pagoEnProceso = rows.some((r) => pagoKind(r) === "pendiente");
  const hayPendientes = rows.some((r) => !r.confirmacion_id);
  usePolling(refetch, pagoEnProceso ? 3000 : hayPendientes ? 10000 : null);

  const pendientes = rows.filter((r) => !r.confirmacion_id).length;
  const recibido = rows.filter((r) => pagoKind(r) === "ok").reduce((acc, r) => acc + Number(r.importe_mxn ?? 0), 0);

  return (
    <div className="animate-fade-in pb-16 md:pb-0">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Hola{nombre ? `, ${nombre.split(" ")[0]}` : ""} 👋</p>
          <h1 className="text-2xl font-bold md:text-3xl">Mis solicitudes</h1>
        </div>
        <Button asChild className="hidden md:inline-flex">
          <Link href="/vendedor/nueva">
            <Plus aria-hidden /> Nueva solicitud
          </Link>
        </Button>
      </div>

      <section aria-label="Resumen" className="mb-6 grid grid-cols-3 gap-2.5 md:gap-4">
        <StatCard label="Solicitudes" value={formatNumber(rows.length)} icon={ListChecks} />
        <StatCard label="Pendientes" value={formatNumber(pendientes)} icon={Clock} tone="warning" />
        <StatCard
          label="Recibido"
          value={<span className="text-[1.15rem] md:text-3xl">{formatMXN(recibido)}</span>}
          icon={Wallet}
          tone="success"
        />
      </section>

      {rows.length === 0 ? (
        <EmptyState
          icon={Droplet}
          title="Aún no tienes solicitudes"
          description="Cuando tengas aceite usado listo, pide la recolección en segundos."
          action={
            <Button asChild size="lg">
              <Link href="/vendedor/nueva">
                <Plus aria-hidden /> Crear mi primera solicitud
              </Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {rows.map((s) => (
            <li key={s.id}>
              <SolicitudCard s={s} />
            </li>
          ))}
        </ul>
      )}

      {/* Botón flotante en móvil, por encima de la navegación inferior */}
      <Link
        href="/vendedor/nueva"
        className="fixed right-4 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-30 inline-flex h-14 items-center gap-2 rounded-full bg-amber px-5 font-semibold text-[#1c1c1a] shadow-float transition-transform duration-150 active:scale-95 md:hidden"
        onClick={() => toast.dismiss()}
      >
        <Plus className="size-5" aria-hidden /> Nueva solicitud
      </Link>
    </div>
  );
}

function SolicitudCard({ s }: { s: SolicitudEstado }) {
  const recolectada = Boolean(s.confirmacion_id);
  return (
    <Link
      href={`/vendedor/solicitud/${s.id}`}
      className="group block rounded-2xl border border-border bg-card p-4 shadow-card transition-[border-color,transform] duration-150 hover:border-amber/70 active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold">{s.nombre_comercio}</p>
          <p className="mt-0.5 text-sm text-muted">
            <RelativeTime date={s.created_at} /> · <span className="font-mono text-xs">#{shortId(s.id)}</span>
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-xl font-bold tabular-nums leading-none">
            {formatNumber(recolectada ? s.litros_reales : s.litros_estimados)}
            <span className="ml-0.5 text-sm font-semibold text-muted">L</span>
          </p>
          <p className="mt-1 text-xs text-muted">{recolectada ? "reales" : "estimados"}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <SolicitudChips s={s} />
        <div className="flex shrink-0 items-center gap-1">
          {pagoKind(s) === "ok" && (
            <span className="font-display font-semibold tabular-nums text-success">{formatMXN(s.importe_mxn)}</span>
          )}
          <ChevronRight className="size-5 text-muted transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
        </div>
      </div>
    </Link>
  );
}
