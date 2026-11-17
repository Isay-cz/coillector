"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CheckCircle2, Loader2, LocateFixed, MapPin, Search } from "lucide-react";
import { Mapa } from "@/components/mapa/mapa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buscarDirecciones, dentroDeZona, direccionDe, miUbicacion, type LatLng, type Lugar } from "@/lib/geo";
import { cn } from "@/lib/utils";

export type UbicacionValor = {
  direccion: string;
  lat: number | null;
  lng: number | null;
  referencias: string;
};

export const REFERENCIAS_MAX = 140;

/** Error de validación para el selector (null si está bien). */
export function validarUbicacion(v: UbicacionValor): string | null {
  if (!v.direccion.trim()) return "Escribe la dirección y elige una sugerencia.";
  if (v.lat == null || v.lng == null) return "Confirma la ubicación: elige una sugerencia, usa tu ubicación o toca el mapa.";
  if (!dentroDeZona({ lat: v.lat, lng: v.lng })) return "Por ahora solo recolectamos en CDMX y zona conurbada.";
  if (v.referencias.length > REFERENCIAS_MAX) return `Las referencias admiten máximo ${REFERENCIAS_MAX} caracteres.`;
  return null;
}

/**
 * Dirección con autocompletado (Photon/OSM), botón de "usar mi ubicación" y
 * mini mapa con pin arrastrable para confirmar el punto exacto.
 */
export function DireccionPicker({
  id = "direccion",
  value,
  onChange,
  error,
}: {
  id?: string;
  value: UbicacionValor;
  onChange: (v: UbicacionValor) => void;
  error?: string | null;
}) {
  const listId = useId();
  const [abierto, setAbierto] = useState(false);
  const [sugerencias, setSugerencias] = useState<Lugar[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [activo, setActivo] = useState(-1);
  const [localizando, setLocalizando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const textoBuscado = useRef<string | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  const coords: LatLng | null = value.lat != null && value.lng != null ? { lat: value.lat, lng: value.lng } : null;

  // Autocompletado con espera de 300 ms entre teclas.
  useEffect(() => {
    const q = value.direccion.trim();
    if (!abierto || q.length < 3 || textoBuscado.current === q) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setBuscando(true);
      try {
        const res = await buscarDirecciones(q, { cerca: coords, signal: ctrl.signal });
        textoBuscado.current = q;
        setSugerencias(res);
        setActivo(-1);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setSugerencias([]);
      } finally {
        if (!ctrl.signal.aborted) setBuscando(false);
      }
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.direccion, abierto]);

  function elegir(l: Lugar) {
    textoBuscado.current = l.direccion;
    onChange({ ...value, direccion: l.direccion, lat: l.lat, lng: l.lng });
    setSugerencias([]);
    setAbierto(false);
    setAviso(null);
  }

  async function usarMiUbicacion() {
    setLocalizando(true);
    setAviso(null);
    try {
      const p = await miUbicacion();
      if (!dentroDeZona(p)) {
        setAviso("Tu ubicación está fuera de CDMX. Escribe la dirección del negocio.");
        return;
      }
      const lugar = await direccionDe(p).catch(() => null);
      const v = valueRef.current;
      textoBuscado.current = lugar?.direccion ?? v.direccion;
      onChange({ ...v, lat: p.lat, lng: p.lng, direccion: lugar?.direccion ?? v.direccion });
      setAbierto(false);
    } catch (e) {
      setAviso((e as Error).message);
    } finally {
      setLocalizando(false);
    }
  }

  async function moverPin(p: LatLng) {
    const v = valueRef.current;
    onChange({ ...v, lat: p.lat, lng: p.lng });
    // Si no había texto, proponemos el de ese punto; si ya escribieron algo, no lo pisamos.
    if (!v.direccion.trim()) {
      const lugar = await direccionDe(p).catch(() => null);
      if (lugar) {
        textoBuscado.current = lugar.direccion;
        onChange({ ...valueRef.current, direccion: lugar.direccion });
      }
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!abierto || sugerencias.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActivo((i) => (i + 1) % sugerencias.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActivo((i) => (i <= 0 ? sugerencias.length - 1 : i - 1));
    } else if (e.key === "Enter" && activo >= 0) {
      e.preventDefault();
      elegir(sugerencias[activo]);
    } else if (e.key === "Escape") {
      setAbierto(false);
    }
  }

  const mostrarLista = abierto && (sugerencias.length > 0 || buscando);
  const describedBy = error ? `${id}-error` : `${id}-hint`;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted" aria-hidden />
        <Input
          id={id}
          role="combobox"
          aria-expanded={mostrarLista}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activo >= 0 ? `${listId}-${activo}` : undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          autoComplete="off"
          placeholder="Calle y número, colonia"
          className="pr-10 pl-11"
          value={value.direccion}
          onChange={(e) => {
            // Si cambian el texto después de elegir, el punto ya no está confirmado.
            onChange({ ...value, direccion: e.target.value, lat: null, lng: null });
            textoBuscado.current = null;
            setAbierto(true);
          }}
          onFocus={() => setAbierto(true)}
          onBlur={() => setTimeout(() => setAbierto(false), 150)}
          onKeyDown={onKeyDown}
        />
        {buscando && (
          <Loader2 className="absolute top-1/2 right-3.5 size-5 -translate-y-1/2 animate-spin text-muted" aria-hidden />
        )}
        {mostrarLista && (
          <ul
            id={listId}
            role="listbox"
            className="absolute inset-x-0 top-[calc(100%+6px)] z-[1000] max-h-72 overflow-auto rounded-xl border border-border bg-card p-1 shadow-float"
          >
            {sugerencias.length === 0 && buscando && <li className="px-3 py-2.5 text-sm text-muted">Buscando…</li>}
            {sugerencias.map((s, i) => (
              <li
                key={`${s.lat},${s.lng},${i}`}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === activo}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => elegir(s)}
                className={cn(
                  "flex cursor-pointer items-start gap-2.5 rounded-lg px-3 py-2.5",
                  i === activo ? "bg-amber-soft" : "hover:bg-ink/5",
                )}
              >
                <MapPin className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">{s.direccion}</span>
                  {s.detalle && <span className="block truncate text-xs text-muted">{s.detalle}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button type="button" variant="outline" onClick={usarMiUbicacion} disabled={localizando} className="justify-start">
        {localizando ? <Loader2 className="animate-spin" aria-hidden /> : <LocateFixed aria-hidden />}
        {localizando ? "Buscando tu ubicación…" : "Usar mi ubicación actual"}
      </Button>

      <Mapa
        className="h-56"
        pin={coords}
        onPinChange={moverPin}
        colocarConToque
        zoom={coords ? 17 : 11}
      />

      <p
        id={`${id}-hint`}
        className={cn("flex items-start gap-1.5 text-sm", coords ? "text-success" : "text-muted")}
        aria-live="polite"
      >
        {coords ? (
          <>
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
            Ubicación marcada. Si el pin no está justo en tu negocio, arrástralo.
          </>
        ) : (
          <>
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
            Elige una sugerencia, usa tu ubicación o toca el mapa para marcar tu negocio.
          </>
        )}
      </p>
      {aviso && <p className="text-sm text-warning">{aviso}</p>}
    </div>
  );
}
