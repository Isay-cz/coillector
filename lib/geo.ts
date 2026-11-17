/** Utilidades de ubicación: CDMX, distancias y geocodificación con Photon (OpenStreetMap, gratis y sin clave). */

export type LatLng = { lat: number; lng: number };

export type Lugar = LatLng & {
  /** Texto corto para mostrar y guardar: "Calle 123, Colonia, Alcaldía". */
  direccion: string;
  /** Segunda línea opcional (CP, ciudad). */
  detalle?: string;
};

/** Centro aproximado de CDMX (Zócalo). */
export const CDMX_CENTRO: LatLng = { lat: 19.4326, lng: -99.1332 };

/** Caja del Valle de México; debe coincidir con el CHECK de la base de datos. */
const LIMITES = { minLat: 18.9, maxLat: 20.0, minLng: -99.6, maxLng: -98.6 };

export function dentroDeZona(p: LatLng): boolean {
  return p.lat >= LIMITES.minLat && p.lat <= LIMITES.maxLat && p.lng >= LIMITES.minLng && p.lng <= LIMITES.maxLng;
}

export function tieneCoords<T extends { lat: number | null; lng: number | null }>(
  x: T,
): x is T & LatLng {
  return x.lat != null && x.lng != null;
}

/** Distancia en km entre dos puntos (fórmula de haversine). */
export function distanciaKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatKm(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toLocaleString("es-MX", { maximumFractionDigits: 1 })} km`;
}

/** Enlace que abre Google Maps exactamente en el punto (o busca el texto si no hay coordenadas). */
export function mapsUrl(p: { lat?: number | null; lng?: number | null; direccion?: string | null }): string {
  if (p.lat != null && p.lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${p.lat.toFixed(6)},${p.lng.toFixed(6)}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.direccion ?? ""}, CDMX`)}`;
}

// ---------------------------------------------------------------------------
// Photon (https://photon.komoot.io): autocompletado y geocodificación inversa.

const PHOTON = "https://photon.komoot.io";
const BBOX = `${LIMITES.minLng},${LIMITES.minLat},${LIMITES.maxLng},${LIMITES.maxLat}`;

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    locality?: string;
    district?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
    osm_key?: string;
    osm_value?: string;
    type?: string;
  };
};

function aLugar(f: PhotonFeature): Lugar {
  const p = f.properties;
  const [lng, lat] = f.geometry.coordinates;
  const calle = p.street ? `${p.street}${p.housenumber ? ` ${p.housenumber}` : ""}` : "";
  // Si el resultado es un lugar con nombre (negocio, parque), lo anteponemos a la calle.
  const nombre = p.name && p.name !== p.street ? p.name : "";
  const colonia = p.locality ?? (p.district && p.district !== p.city ? p.district : undefined);
  const alcaldia = p.county ?? (p.locality ? p.district : undefined) ?? p.city;
  const partes = [nombre, calle, colonia, alcaldia].filter((x, i, arr): x is string => Boolean(x) && arr.indexOf(x) === i);
  const direccion = partes.join(", ") || p.name || "Ubicación sin nombre";
  const detalle = [p.postcode ? `CP ${p.postcode}` : null, p.state].filter(Boolean).join(" · ") || undefined;
  return { lat, lng, direccion, detalle };
}

/** Sugerencias de dirección limitadas al Valle de México, con sesgo hacia `cerca` si se da. */
export async function buscarDirecciones(texto: string, opts: { cerca?: LatLng | null; signal?: AbortSignal } = {}): Promise<Lugar[]> {
  const q = texto.trim();
  if (q.length < 3) return [];
  const params = new URLSearchParams({ q, limit: "6", lang: "default", bbox: BBOX });
  const centro = opts.cerca ?? CDMX_CENTRO;
  params.set("lat", String(centro.lat));
  params.set("lon", String(centro.lng));
  const res = await fetch(`${PHOTON}/api/?${params}`, { signal: opts.signal });
  if (!res.ok) throw new Error(`Photon ${res.status}`);
  const data = (await res.json()) as { features: PhotonFeature[] };
  const vistos = new Set<string>();
  return data.features
    .map(aLugar)
    .filter((l) => dentroDeZona(l))
    .filter((l) => (vistos.has(l.direccion) ? false : (vistos.add(l.direccion), true)));
}

/** Dirección aproximada de un punto (para "Usar mi ubicación" y al mover el pin). */
export async function direccionDe(p: LatLng, signal?: AbortSignal): Promise<Lugar | null> {
  const params = new URLSearchParams({ lat: String(p.lat), lon: String(p.lng), limit: "1", lang: "default" });
  const res = await fetch(`${PHOTON}/reverse?${params}`, { signal });
  if (!res.ok) return null;
  const data = (await res.json()) as { features: PhotonFeature[] };
  const f = data.features[0];
  return f ? { ...aLugar(f), lat: p.lat, lng: p.lng } : null;
}

/** Posición actual del dispositivo. */
export function miUbicacion(timeoutMs = 10000): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Tu navegador no permite obtener la ubicación."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) =>
        reject(
          new Error(
            err.code === err.PERMISSION_DENIED
              ? "No diste permiso para usar tu ubicación."
              : "No pudimos obtener tu ubicación. Intenta de nuevo.",
          ),
        ),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 30000 },
    );
  });
}
