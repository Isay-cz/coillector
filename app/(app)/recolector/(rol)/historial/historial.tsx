"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ChevronRight, Coins, Droplet, History, ScanLine, Truck } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { RelativeTime } from "@/components/relative-time";
import { StatCard } from "@/components/stat-card";
import { StatusChip } from "@/components/status-chip";
import { Button } from "@/components/ui/button";
import { usePolling } from "@/hooks/use-polling";
import { formatFecha, formatLitros, formatMXN, formatNumber } from "@/lib/format";
import { pagoKind } from "@/lib/solicitud";
import { createClient } from "@/lib/supabase/client";
import type { SolicitudEstado } from "@/lib/types";

export function Historial({ userId, initial }: { userId: string; initial: SolicitudEstado[] }) {
  const [rows, setRows] = useState(initial);
  const refetch = useCallback(async () => {
    const { data } = await createClient()
      .from("solicitudes_estado")
      .select("*")
      .eq("recolector_id", userId)
      .order("confirmada_at", { ascending: false });
    if (data) setRows(data);
  }, [userId]);
  usePolling(refetch, rows.some((r) => pagoKind(r) === "pendiente") ? 3000 : null, 60_000);

  const litros = rows.reduce((a, r) => a + Number(r.litros_reales ?? 0), 0);
  const importe = rows.filter((r) => pagoKind(r) === "ok").reduce((a, r) => a + Number(r.importe_mxn ?? 0), 0);

  return (
    <div className="animate-fade-in">
      <h1 className="mb-5 text-2xl font-bold md:text-3xl">Historial</h1>
      <section aria-label="Resumen" className="mb-6 grid grid-cols-3 gap-2.5 md:gap-4">
        <StatCard label="Recolecciones" value={formatNumber(rows.length)} icon={Truck} />
        <StatCard label="Litros" value={formatNumber(litros)} icon={Droplet} tone="amber" />
        <StatCard label="Pagado" value={<span className="text-[1.15rem] md:text-3xl">{formatMXN(importe)}</span>} icon={Coins} tone="success" />
      </section>

      {rows.length === 0 ? (
        <EmptyState
          icon={History}
          title="Aún no confirmas recolecciones"
          description="Cuando confirmes una entrega aparecerá aquí con su litraje y su pago."
          action={
            <Button asChild size="lg">
              <Link href="/recolector/escanear">
                <ScanLine aria-hidden /> Escanear un QR
              </Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {rows.map((s) => {
            const pago = pagoKind(s);
            return (
              <li key={s.id}>
                <Link
                  href={`/recolector/solicitud/${s.id}`}
                  className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card transition-colors duration-150 hover:border-amber/70"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{s.nombre_comercio}</p>
                    <p className="mt-0.5 text-sm text-muted" title={formatFecha(s.confirmada_at)}>
                      <RelativeTime date={s.confirmada_at} /> · {formatLitros(s.litros_reales)}
                    </p>
                    <div className="mt-2">
                      {pago === "ok" && <StatusChip kind="pago-ok" />}
                      {pago === "pendiente" && <StatusChip kind="pago-pendiente" />}
                      {pago === "error" && <StatusChip kind="pago-error" />}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-display text-lg font-bold tabular-nums">{pago === "ok" ? formatMXN(s.importe_mxn) : "—"}</p>
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
