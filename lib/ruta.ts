import { distanciaKm, type LatLng } from "@/lib/geo";

/** Google Maps acepta hasta 9 puntos intermedios sin clave de API (destino + 8). */
export const MAX_PARADAS = 9;

export type Parada<T> = LatLng & { dato: T; litros: number };

export type RutaPlaneada<T> = {
  paradas: (Parada<T> & { tramoKm: number })[];
  totalKm: number;
  totalLitros: number;
  minutos: number;
  /** Paradas con ubicación que quedaron fuera (radio o máximo de paradas). */
  fuera: Parada<T>[];
};

// Velocidad media urbana en CDMX y tiempo por parada, para una estimación honesta.
const KMH_CIUDAD = 18;
const MIN_POR_PARADA = 6;
// La distancia en línea recta subestima la real por calles; factor típico de rodeo urbano.
const FACTOR_CALLES = 1.35;

function largo(origen: LatLng, orden: LatLng[]): number {
  let total = 0;
  let prev = origen;
  for (const p of orden) {
    total += distanciaKm(prev, p);
    prev = p;
  }
  return total;
}

/** Vecino más cercano desde el origen: rápido y razonable como punto de partida. */
function vecinoMasCercano<P extends LatLng>(origen: LatLng, puntos: P[]): P[] {
  const restantes = [...puntos];
  const orden: P[] = [];
  let actual: LatLng = origen;
  while (restantes.length) {
    let mejor = 0;
    let mejorD = Infinity;
    restantes.forEach((p, i) => {
      const d = distanciaKm(actual, p);
      if (d < mejorD) {
        mejorD = d;
        mejor = i;
      }
    });
    actual = restantes[mejor];
    orden.push(restantes.splice(mejor, 1)[0]);
  }
  return orden;
}

/** 2-opt sobre un recorrido abierto (empieza en el origen y no regresa): elimina cruces. */
function dosOpt<P extends LatLng>(origen: LatLng, orden: P[]): P[] {
  let mejor = [...orden];
  let mejorLargo = largo(origen, mejor);
  let mejoro = true;
  while (mejoro) {
    mejoro = false;
    for (let i = 0; i < mejor.length - 1; i++) {
      for (let k = i + 1; k < mejor.length; k++) {
        const candidato = [...mejor.slice(0, i), ...mejor.slice(i, k + 1).reverse(), ...mejor.slice(k + 1)];
        const l = largo(origen, candidato);
        if (l + 1e-9 < mejorLargo) {
          mejor = candidato;
          mejorLargo = l;
          mejoro = true;
        }
      }
    }
  }
  return mejor;
}

/**
 * Elige las paradas más cercanas al origen (dentro de `radioKm` si se da, hasta
 * `maxParadas`) y las ordena para recorrerlas con la menor distancia posible.
 */
export function planearRuta<T>(
  origen: LatLng,
  candidatas: Parada<T>[],
  { radioKm, maxParadas = 8 }: { radioKm?: number | null; maxParadas?: number } = {},
): RutaPlaneada<T> {
  const limite = Math.min(maxParadas, MAX_PARADAS);
  const porCercania = [...candidatas].sort((a, b) => distanciaKm(origen, a) - distanciaKm(origen, b));
  const enRadio = radioKm ? porCercania.filter((p) => distanciaKm(origen, p) <= radioKm) : porCercania;
  const elegidas = enRadio.slice(0, limite);
  const fuera = porCercania.filter((p) => !elegidas.includes(p));

  const orden = dosOpt(origen, vecinoMasCercano(origen, elegidas));
  let prev: LatLng = origen;
  const paradas = orden.map((p) => {
    const tramoKm = distanciaKm(prev, p) * FACTOR_CALLES;
    prev = p;
    return { ...p, tramoKm };
  });
  const totalKm = paradas.reduce((acc, p) => acc + p.tramoKm, 0);
  const totalLitros = paradas.reduce((acc, p) => acc + p.litros, 0);
  const minutos = paradas.length ? Math.round((totalKm / KMH_CIUDAD) * 60 + paradas.length * MIN_POR_PARADA) : 0;
  return { paradas, totalKm, totalLitros, minutos, fuera };
}

const coord = (p: LatLng) => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`;

/** Abre la ruta completa en Google Maps (navegación paso a paso, sin clave). */
export function googleMapsRutaUrl(origen: LatLng | null, paradas: LatLng[]): string {
  if (paradas.length === 0) return "https://www.google.com/maps";
  const destino = paradas[paradas.length - 1];
  const intermedias = paradas.slice(0, -1);
  const params = new URLSearchParams({ api: "1", destination: coord(destino), travelmode: "driving" });
  if (origen) params.set("origin", coord(origen));
  if (intermedias.length) params.set("waypoints", intermedias.map(coord).join("|"));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/**
 * Junta en una sola parada los puntos a menos de `metros` entre sí
 * (p. ej. dos solicitudes del mismo negocio).
 */
export function agruparPorPunto<T>(
  puntos: (LatLng & { litros: number; dato: T })[],
  metros = 40,
): Parada<T[]>[] {
  const grupos: Parada<T[]>[] = [];
  for (const p of puntos) {
    const g = grupos.find((x) => distanciaKm(x, p) * 1000 <= metros);
    if (g) {
      g.dato.push(p.dato);
      g.litros += p.litros;
    } else {
      grupos.push({ lat: p.lat, lng: p.lng, litros: p.litros, dato: [p.dato] });
    }
  }
  return grupos;
}

/** Zonas de referencia por si el recolector no comparte su ubicación. */
export const ZONAS_CDMX: { id: string; nombre: string; centro: LatLng }[] = [
  { id: "centro", nombre: "Centro", centro: { lat: 19.4326, lng: -99.1332 } },
  { id: "roma", nombre: "Roma / Condesa", centro: { lat: 19.4145, lng: -99.1665 } },
  { id: "delvalle", nombre: "Del Valle / Narvarte", centro: { lat: 19.3895, lng: -99.1645 } },
  { id: "coyoacan", nombre: "Coyoacán", centro: { lat: 19.3497, lng: -99.1617 } },
  { id: "polanco", nombre: "Polanco", centro: { lat: 19.4335, lng: -99.1955 } },
  { id: "gam", nombre: "Lindavista / GAM", centro: { lat: 19.4865, lng: -99.1265 } },
  { id: "iztapalapa", nombre: "Iztapalapa", centro: { lat: 19.3574, lng: -99.0927 } },
];
