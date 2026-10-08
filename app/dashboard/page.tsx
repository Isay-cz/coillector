import type { Metadata } from "next";
import { BarChart3, ClipboardList, Clock, Coins, Droplet, Droplets, Store, Truck } from "lucide-react";
import { AppShell } from "@/components/app-shell/app-shell";
import { LitrosPorDiaChart } from "@/components/charts/litros-por-dia";
import { LiveDot, LiveMetrics } from "@/components/live-metrics";
import { PublicHeader } from "@/components/public-header";
import { SiteFooter } from "@/components/site-footer";
import { StatCard } from "@/components/stat-card";
import { Card } from "@/components/ui/card";
import { getProfile } from "@/lib/auth";
import { formatInt, formatMXN, formatNumber } from "@/lib/format";
import { getRecoleccionesPorDia, getResumenPublico, getResumenUsuario } from "@/lib/metrics";
import type { Perfil } from "@/lib/types";

export const metadata: Metadata = { title: "Impacto" };

export default async function DashboardPage() {
  const perfil = await getProfile();
  const [resumen, dias, mio] = await Promise.all([
    getResumenPublico(),
    getRecoleccionesPorDia(),
    perfil ? getResumenUsuario() : Promise.resolve(null),
  ]);

  const content = (
    <div className="animate-fade-in">
      <div className="mb-5">
        <LiveDot />
        <h1 className="mt-2 text-2xl font-bold md:text-3xl">Impacto de Coillector</h1>
        <p className="mt-1 text-muted">Datos reales del piloto en CDMX. Los pagos son simulados.</p>
      </div>

      <LiveMetrics initial={resumen} className="mb-4" />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <MiniStat icon={ClipboardList} label="Solicitudes" value={formatNumber(resumen.solicitudes_totales)} />
        <MiniStat icon={Clock} label="Pendientes" value={formatNumber(resumen.pendientes)} />
        <MiniStat icon={Store} label="Vendedores" value={formatNumber(resumen.vendedores)} />
        <MiniStat icon={Truck} label="Recolectores" value={formatNumber(resumen.recolectores)} />
      </div>

      <Card className="mb-6 p-5">
        <div className="mb-2 flex items-center gap-2">
          <BarChart3 className="size-5 text-warning" aria-hidden />
          <h2 className="font-display text-lg font-semibold">Litros recolectados por día</h2>
        </div>
        <p className="mb-3 text-sm text-muted">Últimos 14 días (hora de CDMX)</p>
        <LitrosPorDiaChart rows={dias} />
      </Card>

      {perfil && mio && <TusNumeros perfil={perfil} mio={mio} />}
    </div>
  );

  if (perfil) return <AppShell perfil={perfil}>{content}</AppShell>;
  return (
    <div className="flex min-h-dvh flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 pb-12 pt-6 md:px-6 md:pt-10">{content}</main>
      <SiteFooter />
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: typeof Store; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/70 px-4 py-3">
      <Icon className="size-5 shrink-0 text-muted" aria-hidden />
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="font-display text-lg font-bold tabular-nums leading-tight">{value}</p>
      </div>
    </div>
  );
}

function TusNumeros({
  perfil,
  mio,
}: {
  perfil: Perfil;
  mio: { litros_recolectados: number | null; estimacion_agua_l: number | null; recompensa_simulada_mxn: number | null };
}) {
  const vendedor = perfil.rol === "vendedor";
  return (
    <section aria-labelledby="tus-numeros">
      <h2 id="tus-numeros" className="mb-3 text-xl font-bold">
        Tus números
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
        <StatCard
          label={vendedor ? "Litros que reciclaste" : "Litros que recolectaste"}
          value={`${formatNumber(mio.litros_recolectados)} L`}
          icon={Droplet}
          tone="amber"
        />
        <StatCard label="Agua protegida (estimación)" value={`${formatInt(mio.estimacion_agua_l)} L`} icon={Droplets} />
        <StatCard
          label={vendedor ? "Dinero recibido" : "Pagos generados"}
          value={formatMXN(mio.recompensa_simulada_mxn)}
          icon={Coins}
          tone="success"
        />
      </div>
    </section>
  );
}
