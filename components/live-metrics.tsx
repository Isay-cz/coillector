"use client";

import { useCallback, useState } from "react";
import { Coins, Droplet, Droplets, Truck } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { usePolling } from "@/hooks/use-polling";
import { formatInt, formatMXN, formatNumber } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import type { ResumenPublico } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Métricas públicas (resumen_publico) que se refrescan solas cada 15 s. */
export function LiveMetrics({ initial, className }: { initial: ResumenPublico; className?: string }) {
  const [r, setR] = useState(initial);
  const refresh = useCallback(async () => {
    const { data } = await createClient().from("resumen_publico").select("*").maybeSingle();
    if (data) setR(data);
  }, []);
  usePolling(refresh, 15000);

  return (
    <div className={cn("grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4", className)}>
      <StatCard label="Litros recolectados" value={`${formatNumber(r.litros_recolectados)} L`} icon={Droplet} tone="amber" />
      <StatCard
        label="Pagado a vendedores"
        value={<span className="text-[1.3rem] md:text-3xl">{formatMXN(r.recompensa_simulada_mxn)}</span>}
        icon={Coins}
        tone="success"
        hint="Pagos simulados"
      />
      <StatCard
        label="Agua protegida"
        value={`${formatInt(r.estimacion_agua_l)} L`}
        icon={Droplets}
        tone="forest"
        hint="Estimación: 1 L de aceite ≈ 1,000 L de agua"
      />
      <StatCard label="Recolecciones" value={formatNumber(r.recolecciones)} icon={Truck} tone="warning" />
    </div>
  );
}

export function LiveDot({ label = "En vivo" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-success" />
      </span>
      {label}
    </span>
  );
}
