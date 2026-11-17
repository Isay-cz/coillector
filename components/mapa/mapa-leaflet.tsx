"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import type { LatLng } from "@/lib/geo";

export type MarcadorMapa = LatLng & {
  id: string;
  /** Texto dentro del marcador (p. ej. número de parada). */
  etiqueta?: string;
  /** Texto al pasar el dedo/cursor. */
  titulo?: string;
  tono?: "pin" | "parada" | "yo" | "inactivo";
};

export type MapaProps = {
  centro?: LatLng;
  zoom?: number;
  marcadores?: MarcadorMapa[];
  /** Pin único que se puede arrastrar (selector de ubicación). */
  pin?: LatLng | null;
  onPinChange?: (p: LatLng) => void;
  /** Si se da, tocar el mapa coloca el pin ahí. */
  colocarConToque?: boolean;
  ruta?: LatLng[];
  /** Ajusta la vista para que todo quepa. */
  ajustar?: boolean;
  onMarcadorClick?: (id: string) => void;
  className?: string;
};

// Mosaicos oficiales de OpenStreetMap: gratis y sin clave (uso moderado, con atribución).
const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATRIBUCION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

function icono(m: Pick<MarcadorMapa, "etiqueta" | "tono">): L.DivIcon {
  const tono = m.tono ?? "parada";
  if (tono === "pin") {
    return L.divIcon({
      className: "coil-pin",
      html: '<span class="coil-pin__gota"></span><span class="coil-pin__sombra"></span>',
      iconSize: [36, 44],
      iconAnchor: [18, 42],
    });
  }
  if (tono === "yo") {
    return L.divIcon({ className: "coil-yo", html: "<span></span>", iconSize: [22, 22], iconAnchor: [11, 11] });
  }
  return L.divIcon({
    className: `coil-parada ${tono === "inactivo" ? "coil-parada--inactiva" : ""}`,
    html: `<span>${m.etiqueta ?? ""}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function Ajustar({ puntos, activo }: { puntos: LatLng[]; activo: boolean }) {
  const map = useMap();
  const clave = puntos.map((p) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`).join("|");
  useEffect(() => {
    if (!activo || puntos.length === 0) return;
    if (puntos.length === 1) {
      map.setView([puntos[0].lat, puntos[0].lng], Math.max(map.getZoom(), 16));
      return;
    }
    map.fitBounds(L.latLngBounds(puntos.map((p) => [p.lat, p.lng])), { padding: [36, 36], maxZoom: 16 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, activo, map]);
  return null;
}

function SeguirPin({ pin }: { pin: LatLng | null | undefined }) {
  const map = useMap();
  const lat = pin?.lat;
  const lng = pin?.lng;
  useEffect(() => {
    if (lat == null || lng == null) return;
    const actual = map.getCenter();
    if (Math.abs(actual.lat - lat) > 1e-6 || Math.abs(actual.lng - lng) > 1e-6) {
      map.setView([lat, lng], Math.max(map.getZoom(), 17), { animate: true });
    }
  }, [lat, lng, map]);
  return null;
}

function Toques({ onToque }: { onToque: (p: LatLng) => void }) {
  useMapEvents({ click: (e) => onToque({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

export default function MapaLeaflet({
  centro,
  zoom = 13,
  marcadores = [],
  pin,
  onPinChange,
  colocarConToque,
  ruta,
  ajustar,
  onMarcadorClick,
  className,
}: MapaProps) {
  const inicio = pin ?? centro ?? marcadores[0] ?? { lat: 19.4326, lng: -99.1332 };
  const pinIcono = useMemo(() => icono({ tono: "pin" }), []);
  const puntosAjuste = useMemo(
    () => [...marcadores, ...(ruta ?? [])],
    [marcadores, ruta],
  );

  return (
    <MapContainer
      center={[inicio.lat, inicio.lng]}
      zoom={pin ? 17 : zoom}
      scrollWheelZoom={false}
      className={className}
      attributionControl
    >
      <TileLayer url={TILE_URL} attribution={ATRIBUCION} maxZoom={19} />
      {ruta && ruta.length > 1 && (
        <Polyline
          positions={ruta.map((p) => [p.lat, p.lng] as [number, number])}
          pathOptions={{ color: "#1f3d2b", weight: 4, opacity: 0.85, dashArray: "8 8" }}
        />
      )}
      {marcadores.map((m) => (
        <Marker
          key={m.id}
          position={[m.lat, m.lng]}
          icon={icono(m)}
          eventHandlers={onMarcadorClick ? { click: () => onMarcadorClick(m.id) } : undefined}
        >
          {m.titulo && <Tooltip direction="top" offset={[0, -14]}>{m.titulo}</Tooltip>}
        </Marker>
      ))}
      {pin && (
        <Marker
          position={[pin.lat, pin.lng]}
          icon={pinIcono}
          draggable={Boolean(onPinChange)}
          eventHandlers={{
            dragend: (e) => {
              const ll = (e.target as L.Marker).getLatLng();
              onPinChange?.({ lat: ll.lat, lng: ll.lng });
            },
          }}
        />
      )}
      {colocarConToque && onPinChange && <Toques onToque={onPinChange} />}
      {pin && <SeguirPin pin={pin} />}
      {ajustar && <Ajustar puntos={puntosAjuste} activo />}
    </MapContainer>
  );
}
