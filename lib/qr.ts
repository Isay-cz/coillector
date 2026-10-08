import { isUuid } from "@/lib/types";

export type CodigoSolicitud = { id: string } | { short: string };

/** Acepta la URL del QR de Coillector, el UUID de la solicitud o el código corto de 8 caracteres. */
export function parseCodigoSolicitud(text: string): CodigoSolicitud | null {
  const t = text.trim();
  const fromUrl = t.match(/\/recolector\/solicitud\/([0-9a-f-]{36})/i)?.[1];
  if (fromUrl && isUuid(fromUrl)) return { id: fromUrl.toLowerCase() };
  if (isUuid(t)) return { id: t.toLowerCase() };
  const short = t.replace(/^#/, "").replace(/[\s-]/g, "").toUpperCase();
  if (/^[0-9A-F]{8}$/.test(short)) return { short };
  return null;
}
