"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Droplets, Loader2, LocateFixed, MapPinOff, Navigation, PartyPopper, Route } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Mapa, type MarcadorMapa } from "@/components/mapa/mapa";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePolling } from "@/hooks/use-polling";
import { useRealtimeRefetch } from "@/hooks/use-realtime-refetch";
import { formatLitros } from "@/lib/format";
import { dentroDeZona, formatKm, miUbicacion, tieneCoords, type LatLng } from "@/lib/geo";
import { agruparPorPunto, googleMapsRutaUrl, planearRuta, ZONAS_CDMX, type Parada } from "@/lib/ruta";
import { ESTADO_PENDIENTE } from "@/lib/solicitud";
import { createClient } from "@/lib/supabase/client";
import type { SolicitudEstado } from "@/lib/types";
import { cn } from "@/lib/utils";

const RADIOS = [
  { km: 3, label: "3 km" },
  { km: 5, label: "5 km" },
  { km: 10, label: "10 km" },
  { km: null, label: "Toda la ciudad" },
] as const;

type Origen = { punto: LatLng; fuente: "gps" | "zona"; nombre: string };

export function RutaSugerida({ initial }: { initial: SolicitudEstado[] }) {
  const [rows, setRows] = useState(initial);
  const [origen, setOrigen] = useState<Origen | null>(null);
  const [localizando, setLocalizando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [radioKm, setRadioKm] = useState<number | null>(5);

  const refetch = useCallback(async () => {
    const { data } = await createClient()
      .from("solicitudes_estado")
      .select("*")
      .eq("estado_recoleccion", ESTADO_PENDIENTE)
      .order("created_at", { ascending: true });
    if (data) setRows(data);
  }, []);
  useRealtimeRefetch(
    "recolector-ruta",
    [
      { table: "solicitudes", event: "INSERT" },
      { table: "confirmaciones", event: "INSERT" },
    ],
    refetch,
  );
  usePolling(refetch, 20000);

  const ubicar = useCallback(async () => {
    setLocalizando(true);
    setAviso(null);
    try {
      const p = await miUbicacion();
      if (!dentroDeZona(p)) {
        setAviso("Estás fuera de CDMX: elige una zona para calcular la ruta.");
        return;
      }
      setOrigen({ punto: p, fuente: "gps", nombre: "Tu ubicación" });
    } catch (e) {
      setAviso(`${(e as Error).message} Elige una zona para calcular la ruta.`);
    } finally {
      setLocalizando(false);
    }
  }, []);

  // Al abrir, intentamos con el GPS; si no hay permiso, el recolector elige su zona.
  useEffect(() => {
    void ubicar();
  }, [ubicar]);

  const conUbicacion = useMemo(() => rows.filter(tieneCoords), [rows]);
  const candidatas = useMemo<Parada<SolicitudEstado[]>[]>(
    () => agruparPorPunto(conUbicacion.map((s) => ({ lat: s.lat, lng: s.lng, litros: Number(s.litros_estimados ?? 0), dato: s }))),
    [conUbicacion],
  );
  const sinUbicacion = rows.length - conUbicacion.length;

  const ruta = useMemo(
    () => (origen ? planearRuta(origen.punto, candidatas, { radioKm }) : null),
    [origen, candidatas, radioKm],
  );

  const marcadores = useMemo<MarcadorMapa[]>(() => {
    if (!origen || !ruta) return [];
    return [
      { id: "yo", ...origen.punto, tono: "yo", titulo: origen.nombre },
      ...ruta.paradas.map((p, i) => ({
        id: p.dato[0].id!,
        lat: p.lat,
        lng: p.lng,
        etiqueta: String(i + 1),
        titulo: `${i + 1}. ${nombreParada(p.dato)} · ${formatLitros(p.litros)}`,
      })),
      ...ruta.fuera.map((p) => ({
        id: p.dato[0].id!,
        lat: p.lat,
        lng: p.lng,
        tono: "inactivo" as const,
        titulo: `${nombreParada(p.dato)} (fuera de esta ruta)`,
      })),
    ];
  }, [origen, ruta]);

  if (rows.length === 0) {
    return (
      <div className="animate-fade-in">
        <Encabezado />
        <EmptyState
          icon={PartyPopper}
          title="No hay recolecciones pendientes"
          description="Cuando un vendedor pida una recolección, aquí aparecerá la mejor ruta para cubrirla."
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Encabezado />

      <Card className="mb-4 flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm">
            <span className="text-muted">Salida: </span>
            <span className="font-medium">{origen ? origen.nombre : localizando ? "Buscando tu ubicación…" : "Elige una zona"}</span>
          </p>
          <Button type="button" size="sm" variant="outline" onClick={ubicar} disabled={localizando}>
            {localizando ? <Loader2 className="animate-spin" aria-hidden /> : <LocateFixed aria-hidden />}
            GPS
          </Button>
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Zona de salida">
          {ZONAS_CDMX.map((z) => (
            <Chip
              key={z.id}
              activo={origen?.fuente === "zona" && origen.nombre === z.nombre}
              onClick={() => setOrigen({ punto: z.centro, fuente: "zona", nombre: z.nombre })}
            >
              {z.nombre}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Distancia máxima">
          <span className="text-sm text-muted">Radio:</span>
          {RADIOS.map((r) => (
            <Chip key={r.label} activo={radioKm === r.km} onClick={() => setRadioKm(r.km)}>
              {r.label}
            </Chip>
          ))}
        </div>
        {aviso && <p className="text-sm text-warning">{aviso}</p>}
      </Card>

      {ruta && (
        <section aria-label="Resumen de la ruta" className="mb-4 grid grid-cols-3 gap-2.5">
          <StatCard label="Paradas" value={String(ruta.paradas.length)} icon={Route} />
          <StatCard label="Litros" value={formatLitros(ruta.totalLitros)} icon={Droplets} tone="amber" />
          <StatCard
            label="Recorrido"
            value={<span className="text-[1.05rem] md:text-2xl">{formatKm(ruta.totalKm)}</span>}
            icon={Navigation}
            tone="success"
          />
        </section>
      )}

      <Mapa
        className="mb-4 h-72 md:h-96"
        centro={origen?.punto}
        zoom={12}
        marcadores={marcadores}
        ruta={origen && ruta ? [origen.punto, ...ruta.paradas] : undefined}
        ajustar
      />

      {ruta && ruta.paradas.length > 0 && (
        <>
          <Button asChild size="lg" className="mb-2 w-full">
            <a href={googleMapsRutaUrl(origen?.punto ?? null, ruta.paradas)} target="_blank" rel="noopener noreferrer">
              <Navigation aria-hidden /> Iniciar ruta en Google Maps
            </a>
          </Button>
          <p className="mb-5 text-center text-sm text-muted">
            Aprox. {formatKm(ruta.totalKm)} por calle · {ruta.minutos} min con paradas
          </p>

          <ol className="flex flex-col gap-2.5">
            {ruta.paradas.map((p, i) => (
              <li key={p.dato[0].id}>
                <Link
                  href={`/recolector/solicitud/${p.dato[0].id}`}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card transition-colors hover:bg-amber-soft/40"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-forest font-display font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{nombreParada(p.dato)}</span>
                    <span className="block truncate text-sm text-muted">{p.dato[0].direccion}</span>
                    {p.dato.length > 1 && (
                      <span className="block text-xs font-medium text-warning">{p.dato.length} solicitudes en este punto</span>
                    )}
                    <span className="mt-0.5 block text-xs text-muted">
                      {i === 0 ? "Desde la salida" : "Desde la parada anterior"}: {formatKm(p.tramoKm)}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block font-display text-lg font-bold">{formatLitros(p.litros)}</span>
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden />
                </Link>
              </li>
            ))}
          </ol>
        </>
      )}

      {ruta && ruta.paradas.length === 0 && (
        <p className="rounded-xl bg-warning-soft p-3 text-sm text-warning">
          No hay solicitudes dentro de {radioKm} km. Amplía el radio o elige otra zona.
        </p>
      )}

      {(sinUbicacion > 0 || (ruta?.fuera.length ?? 0) > 0) && (
        <p className="mt-4 flex items-start gap-2 text-sm text-muted">
          <MapPinOff className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            {ruta && ruta.fuera.length > 0 && `${ruta.fuera.length} fuera de esta ruta (en gris en el mapa). `}
            {sinUbicacion > 0 &&
              `${sinUbicacion} sin ubicación confirmada: consúltala${sinUbicacion > 1 ? "s" : ""} en Pendientes.`}
          </span>
        </p>
      )}
    </div>
  );
}

function nombreParada(solicitudes: SolicitudEstado[]): string {
  const nombres = [...new Set(solicitudes.map((s) => s.nombre_comercio ?? "Sin nombre"))];
  return nombres.length > 1 ? `${nombres[0]} y ${nombres.length - 1} más` : nombres[0];
}

function Encabezado() {
  return (
    <div className="mb-5">
      <h1 className="text-2xl font-bold md:text-3xl">Ruta sugerida</h1>
      <p className="text-sm text-muted">Las recolecciones más cercanas, en el orden con menos vueltas.</p>
    </div>
  );
}

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={cn(
        "h-9 shrink-0 rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-colors",
        activo ? "border-forest bg-forest text-white dark:border-amber dark:bg-amber dark:text-[#1c1c1a]" : "border-border bg-card text-ink hover:bg-amber-soft/60",
      )}
    >
      {children}
    </button>
  );
}
